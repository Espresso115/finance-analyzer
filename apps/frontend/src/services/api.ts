import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';
import type {
  ApiKeysResponse,
  CreatedApiKeyResponse,
  SettingsResponse,
  UserResponse
} from '../types/user';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type AuthInterceptorConfig = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

let authConfig: AuthInterceptorConfig | null = null;

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { error?: string | { message?: string }; message?: string }
      | undefined;

    if (typeof responseData?.error === 'string') {
      return responseData.error;
    }

    if (responseData?.error?.message) {
      return responseData.error.message;
    }

    if (responseData?.message) {
      return responseData.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const configureAuthInterceptors = (config: AuthInterceptorConfig) => {
  authConfig = config;
};

apiClient.interceptors.request.use((config) => {
  const accessToken = authConfig?.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const accessToken = await authConfig?.refreshAccessToken();

    if (!accessToken) {
      authConfig?.onAuthFailure();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(originalRequest);
  }
);

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/refresh', {
      refreshToken
    });
    return data;
  },

  async logout() {
    await apiClient.post('/api/v1/auth/logout');
  }
};

export const userApi = {
  async getMe() {
    const { data } = await apiClient.get<UserResponse>('/api/v1/users/me');
    return data;
  },

  async updateProfile(payload: { bio?: string; avatarUrl?: string; company?: string }) {
    const { data } = await apiClient.put<UserResponse>('/api/v1/users/profile', payload);
    return data;
  },

  async getSettings() {
    const { data } = await apiClient.get<SettingsResponse>('/api/v1/users/settings');
    return data;
  },

  async updateSettings(payload: Partial<SettingsResponse['settings']>) {
    const { data } = await apiClient.put<SettingsResponse>('/api/v1/users/settings', payload);
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    const { data } = await apiClient.post<{ success: boolean; message: string }>(
      '/api/v1/users/change-password',
      payload
    );
    return data;
  },

  async listApiKeys() {
    const { data } = await apiClient.get<ApiKeysResponse>('/api/v1/users/api-keys');
    return data;
  },

  async createApiKey(name: string) {
    const { data } = await apiClient.post<CreatedApiKeyResponse>('/api/v1/users/api-keys', {
      name
    });
    return data;
  },

  async revokeApiKey(keyId: string) {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/users/api-keys/${keyId}`
    );
    return data;
  }
};
