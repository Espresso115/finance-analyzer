import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';
import type {
  ApiKeysResponse,
  CreatedApiKeyResponse,
  SettingsResponse,
  UserResponse
} from '../types/user';
import type {
  AssetType,
  MarketDataResponse,
  MarketHistory,
  MarketInstrument,
  MarketQuote
} from '../types/market';
import type { RAGDocument, RetrievedSource } from '../types/rag';

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

    // Skip retry for:
    // - Non-401 errors
    // - Already-retried requests
    // - The /auth/refresh endpoint itself (would cause infinite loop)
    // - Requests with no auth config (unauthenticated calls)
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshEndpoint ||
      !authConfig
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const accessToken = await authConfig.refreshAccessToken();

    if (!accessToken) {
      authConfig.onAuthFailure();
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
  },

  async deleteAccount(password: string) {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>('/api/v1/users/me', {
      data: { password }
    });
    return data;
  }
};

export const marketApi = {
  async search(params: { q?: string; type?: AssetType } = {}) {
    const { data } = await apiClient.get<MarketDataResponse<MarketInstrument[]>>(
      '/api/v1/market/search',
      { params }
    );
    return data;
  },

  async getQuote(symbol: string) {
    const { data } = await apiClient.get<MarketDataResponse<MarketQuote>>(
      `/api/v1/market/quote/${encodeURIComponent(symbol)}`
    );
    return data;
  },

  async getSummary(symbols: string[]) {
    const { data } = await apiClient.get<MarketDataResponse<MarketQuote[]>>(
      '/api/v1/market/summary',
      {
        params: {
          symbols: symbols.join(',')
        }
      }
    );
    return data;
  },

  async getHistory(symbol: string, range: MarketHistory['range'] = '30d') {
    const { data } = await apiClient.get<MarketDataResponse<MarketHistory>>(
      `/api/v1/market/history/${encodeURIComponent(symbol)}`,
      { params: { range } }
    );
    return data;
  },

  getExportUrl(symbols: string[], format: 'json' | 'csv' = 'csv') {
    const searchParams = new URLSearchParams({
      symbols: symbols.join(','),
      format
    });
    return `${API_BASE_URL}/api/v1/market/export?${searchParams.toString()}`;
  },

  async exportCsv(symbols: string[]) {
    const { data } = await apiClient.get<string>('/api/v1/market/export', {
      params: {
        symbols: symbols.join(','),
        format: 'csv'
      },
      responseType: 'text'
    });
    return data;
  }
};

type ApiDocument = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
  tags?: string[];
  textPreview?: string;
  chunkCount?: number;
  processedAt?: string;
  createdAt: string;
};

type ApiAnalysisSource = {
  documentId: string;
  documentName: string;
  snippet: string;
  score: number;
};

const mimeToFileType = (mimeType: string, filename: string): RAGDocument['fileType'] => {
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (extension === 'docx' || mimeType.includes('wordprocessingml')) return 'docx';
  if (extension === 'md' || mimeType === 'text/markdown') return 'md';
  if (extension === 'csv' || mimeType === 'text/csv') return 'csv';
  return 'txt';
};

const mapDocumentStatus = (status: ApiDocument['status']): RAGDocument['status'] => {
  if (status === 'completed') return 'indexed';
  if (status === 'error') return 'failed';
  return status;
};

const mapDocument = (document: ApiDocument): RAGDocument => ({
  id: document.id,
  filename: document.originalName || document.filename,
  fileType: mimeToFileType(document.mimeType, document.originalName || document.filename),
  fileSize: document.size,
  status: mapDocumentStatus(document.status),
  chunkCount: document.chunkCount || 0,
  uploadedAt: document.createdAt,
  processedAt: document.processedAt,
  tags: document.tags || [],
  description: document.description,
  preview: document.textPreview
});

const mapAnalysisSource = (source: ApiAnalysisSource, index: number): RetrievedSource => ({
  sourceId: index + 1,
  score: Math.max(0, Math.min(Number(source.score) || 0, 1)),
  documentId: source.documentId,
  chunkId: '',
  sectionId: '',
  filename: source.documentName,
  text: source.snippet,
  metadata: {}
});

export const documentApi = {
  async list() {
    const { data } = await apiClient.get<{ success: boolean; data: ApiDocument[] }>(
      '/api/v1/documents'
    );
    return data.data.map(mapDocument);
  },

  async upload(files: File[], onUploadProgress?: (progress: number) => void) {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));

    const { data } = await apiClient.post<{ success: boolean; data: ApiDocument[] }>(
      '/api/v1/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (event) => {
          if (!event.total || !onUploadProgress) return;
          onUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      }
    );

    return data.data.map(mapDocument);
  },

  async delete(documentId: string) {
    await apiClient.delete(`/api/v1/documents/${documentId}`);
  }
};

export const analysisApi = {
  async query(payload: { query: string; limit?: number; documentIds?: string[]; conversationId?: string | null }) {
    const { data } = await apiClient.post<{
      success: boolean;
      data: {
        id: string;
        query: string;
        response: string;
        sources: ApiAnalysisSource[];
        provider: string;
        fallback: boolean;
      };
    }>('/api/v1/analysis/query', payload);

    return {
      ...data.data,
      sources: data.data.sources.map(mapAnalysisSource)
    };
  }
};

type ApiConversationMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: ApiAnalysisSource[];
  timestamp?: string;
};

type ApiConversation = {
  id: string;
  title: string;
  documentIds: string[];
  messages: ApiConversationMessage[];
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

type ConversationListResponse = { success: boolean; data: ApiConversation[] };
type ConversationResponse = { success: boolean; data: ApiConversation };

export const conversationApi = {
  async list() {
    const { data } = await apiClient.get<ConversationListResponse>('/api/v1/conversations');
    return data.data;
  },

  async get(conversationId: string) {
    const { data } = await apiClient.get<ConversationResponse>(`/api/v1/conversations/${conversationId}`);
    return data.data;
  },

  async create(title: string, documentIds: string[] = []) {
    const { data } = await apiClient.post<ConversationResponse>('/api/v1/conversations', {
      title,
      documentIds
    });
    return data.data;
  },

  async rename(conversationId: string, title: string) {
    const { data } = await apiClient.put<ConversationResponse>(`/api/v1/conversations/${conversationId}`, {
      title
    });
    return data.data;
  },

  async delete(conversationId: string) {
    await apiClient.delete(`/api/v1/conversations/${conversationId}`);
  },

  async addMessage(conversationId: string, message: ApiConversationMessage) {
    const { data } = await apiClient.post<ConversationResponse>(
      `/api/v1/conversations/${conversationId}/messages`,
      { message }
    );
    return data.data;
  }
};
