import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

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
