export type UserRole = 'user' | 'analyst' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: UserRole;
};

export type AuthResponse = {
  success: boolean;
  token?: string;
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  username: string;
};
