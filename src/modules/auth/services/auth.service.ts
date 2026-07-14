import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AuthSessionDto,
  AuthTokensDto,
  AuthUserDto,
  EmailVerificationRequiredDto,
  LoginPayload,
  RegisterPayload,
  UserRole,
  VerifyEmailPayload,
} from "../types/auth.types";

export async function registerUser(
  payload: RegisterPayload,
): Promise<EmailVerificationRequiredDto> {
  const { data } = await axiosInstance.post<EmailVerificationRequiredDto>(
    "/auth/register",
    payload,
  );
  return data;
}

export async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<AuthSessionDto> {
  const { data } = await axiosInstance.post<AuthSessionDto>(
    "/auth/verify-email",
    payload,
  );
  return data;
}

export async function resendEmailVerification(email: string): Promise<void> {
  await axiosInstance.post("/auth/verify-email/resend", { email });
}

export async function loginUser(payload: LoginPayload): Promise<AuthSessionDto> {
  const { data } = await axiosInstance.post<AuthSessionDto>(
    "/auth/login",
    payload,
  );
  return data;
}

export async function getCurrentUser(): Promise<AuthUserDto> {
  const { data } = await axiosInstance.get<AuthUserDto>("/auth/me");
  return data;
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthTokensDto> {
  const { data } = await axiosInstance.post<AuthTokensDto>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

export async function logoutUser(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

export async function assignUserRole(
  userId: string,
  role: UserRole,
): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>(
    `/auth/users/${userId}/role`,
    { role },
  );
  return data;
}
