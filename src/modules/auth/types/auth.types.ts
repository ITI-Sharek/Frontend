export type UserRole = "owner" | "contributor" | "admin";

export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: string;
  preferredLanguage: "en" | "ar";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
}

export interface AuthSessionDto {
  user: AuthUserDto;
  tokens: AuthTokensDto;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Extract<UserRole, "owner" | "contributor">;
  preferredLanguage: "en" | "ar";
}

export interface LoginPayload {
  email: string;
  password: string;
}
