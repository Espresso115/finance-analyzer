import { create } from 'zustand';
import { authApi, configureAuthInterceptors, getApiErrorMessage, userApi } from '../services/api';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  syncUser: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
};

const ACCESS_TOKEN_KEY = 'financial-ai.accessToken';
const REFRESH_TOKEN_KEY = 'financial-ai.refreshToken';
const USER_KEY = 'financial-ai.user';

const readStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);
  return rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
};

const persistAuth = (payload: AuthResponse) => {
  const accessToken = payload.accessToken || payload.token;

  if (!accessToken) {
    throw new Error('Authentication response did not include an access token');
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));

  if (payload.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  }

  return {
    accessToken,
    refreshToken: payload.refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY),
    user: payload.user
  };
};

const clearStoredAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'idle',
  error: null,

  hydrate: async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const user = readStoredUser();

    if (!accessToken || !refreshToken || !user) {
      clearStoredAuth();
      set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' });
      return;
    }

    // Optimistically restore session from storage first so the UI doesn't
    // flash a loading spinner — we'll validate in the background.
    set({ user, accessToken, refreshToken, status: 'authenticated', error: null });

    // Proactively attempt a refresh to validate the stored tokens.
    // If the server rejects them (e.g. JWT secret was rotated), clear session.
    try {
      const { data } = await import('../services/api').then(m =>
        m.apiClient.post<{ accessToken?: string; token?: string }>('/api/v1/auth/refresh', {
          refreshToken
        })
      );
      const newAccessToken = data.accessToken || data.token;
      if (newAccessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        set({ accessToken: newAccessToken });
      }
    } catch {
      // Token is invalid (signature mismatch, expired, etc.) — force logout
      clearStoredAuth();
      set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated', error: null });
    }
  },

  syncUser: async () => {
    const { user } = await userApi.getMe();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, status: 'authenticated', error: null });
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  login: async (payload) => {
    set({ status: 'loading', error: null });

    try {
      const auth = persistAuth(await authApi.login(payload));
      set({ ...auth, status: 'authenticated', error: null });
    } catch (error) {
      set({ status: 'unauthenticated', error: getApiErrorMessage(error) });
      throw error;
    }
  },

  register: async (payload) => {
    set({ status: 'loading', error: null });

    try {
      const auth = persistAuth(await authApi.register(payload));
      set({ ...auth, status: 'authenticated', error: null });
    } catch (error) {
      set({ status: 'unauthenticated', error: getApiErrorMessage(error) });
      throw error;
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      get().clearSession();
      return null;
    }

    try {
      const auth = persistAuth(await authApi.refresh(refreshToken));
      set({ ...auth, status: 'authenticated', error: null });
      return auth.accessToken;
    } catch {
      get().clearSession();
      return null;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      get().clearSession();
    }
  },

  clearSession: () => {
    clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'unauthenticated',
      error: null
    });
    // Clear chat data so a new user cannot see previous user's conversations
    import('@/store/ragStore').then(({ useRagStore }) => {
      useRagStore.getState().clearSession();
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));

configureAuthInterceptors({
  getAccessToken: () => useAuthStore.getState().accessToken || localStorage.getItem(ACCESS_TOKEN_KEY),
  refreshAccessToken: () => useAuthStore.getState().refreshAccessToken(),
  onAuthFailure: () => useAuthStore.getState().clearSession()
});
