export type UserRole = 'user' | 'analyst' | 'admin';

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  marketAlertsEnabled?: boolean;
  defaultWatchlist?: string[];
};

export type UserProfile = {
  bio: string;
  avatarUrl: string;
  company: string;
  preferences: UserPreferences;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile?: UserProfile;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  success: boolean;
  token?: string;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type LoginPayload = {
  identifier?: string;
  email?: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};
