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
  /**
   * Not yet accepted by POST /auth/register (backend auto-generates usernames
   * in the contributor-profile ensure flow). Collected only when
   * REGISTER_USERNAME_FIELD_ENABLED is on; stripped before sending until the
   * backend supports it (DEC-016 — see api-contract-additions.md §2).
   */
  username?: string;
  role: Extract<UserRole, "owner" | "contributor">;
  preferredLanguage: "en" | "ar";
}

export interface LoginPayload {
  email: string;
  password: string;
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
 * Mirrors the agreed backend contract for GET /auth/username-availability
 * (see docs/design/api-contract-additions.md §2, DEC-016). `reason` is a
 * frontend-only enrichment for UI copy, not part of the backend response.
 */
export type UsernameAvailabilityReason = "invalid_format" | "reserved" | "taken";

export interface UsernameAvailabilityResult {
  available: boolean;
  suggestion: string | null;
  reason: UsernameAvailabilityReason | null;
}
