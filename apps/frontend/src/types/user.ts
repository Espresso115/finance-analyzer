import type { AuthUser, UserPreferences } from './auth';

export type ApiKeySummary = {
  id: string;
  name: string;
  keyPrefix: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

export type CreatedApiKey = ApiKeySummary & {
  key: string;
};

export type UserResponse = {
  success: boolean;
  user: AuthUser;
};

export type SettingsResponse = {
  success: boolean;
  settings: UserPreferences;
};

export type ApiKeysResponse = {
  success: boolean;
  apiKeys: ApiKeySummary[];
};

export type CreatedApiKeyResponse = {
  success: boolean;
  apiKey: CreatedApiKey;
};
