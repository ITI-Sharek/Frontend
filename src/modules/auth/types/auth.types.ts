export type UserRole = "owner" | "contributor" | "admin";

export interface AuthUserDto {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: string;
  preferredLanguage: "en" | "ar";
  phoneNumber?: string | null;
  phoneVerifiedAt?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  gender?: "male" | "female" | "prefer_not_to_say" | null;
  dateOfBirth?: string | null;
  profileVisibility?: "public" | "members" | "private";
  showEmail?: boolean;
  showPhone?: boolean;
  showActivity?: boolean;
  allowIndexing?: boolean;
  identityVerificationStatus?: "unverified" | "pending" | "verified" | "rejected";
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
  username: string;
  role: Extract<UserRole, "owner" | "contributor">;
  preferredLanguage: "en" | "ar";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateCurrentUserPreferencesDto {
  preferredLanguage: "en" | "ar";
}

export interface UpdatePersonalDetailsDto {
  firstName: string; lastName: string; country?: string; region?: string;
  city?: string; gender?: "male" | "female" | "prefer_not_to_say"; dateOfBirth?: string;
}

export interface UpdatePrivacyDto {
  profileVisibility: "public" | "members" | "private";
  showEmail: boolean; showPhone: boolean; showActivity: boolean; allowIndexing: boolean;
}

/**
 * Returned by POST /auth/register (backend docs/api-contracts.md): a pending
 * user plus OTP metadata — tokens arrive only after email verification.
 */
export interface EmailVerificationRequiredDto {
  user: AuthUserDto;
  emailVerificationRequired: true;
  verificationExpiresAt: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

/**
 * Returned by GET /auth/username-availability.
 */
export type UsernameAvailabilityReason = "invalid_format" | "reserved" | "taken";

export interface UsernameAvailabilityResult {
  available: boolean;
  suggestion: string | null;
  reason: UsernameAvailabilityReason | null;
}
