import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AuthSessionDto,
  AuthTokensDto,
  AuthUserDto,
  EmailVerificationRequiredDto,
  LoginPayload,
  RegisterPayload,
  UpdateCurrentUserPreferencesDto,
  UpdatePersonalDetailsDto,
  UpdatePrivacyDto,
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

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  const { data } = await axiosInstance.patch<{ message: string }>("/auth/me/password", input);
  return data;
}

export async function updateEmail(input: { email: string; password: string }): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>("/auth/me/email", input);
  return data;
}

export async function updateUsername(username: string): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>("/auth/me/username", { username });
  return data;
}

export async function updatePersonalDetails(input: UpdatePersonalDetailsDto): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>("/auth/me/details", input);
  return data;
}

export async function updatePhone(phoneNumber: string | null): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>("/auth/me/phone", { phoneNumber });
  return data;
}

export async function updatePrivacy(input: UpdatePrivacyDto): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>("/auth/me/privacy", input);
  return data;
}

export async function uploadIdentityDocument(file: File): Promise<AuthUserDto> {
  const form = new FormData(); form.append("file", file);
  const { data } = await axiosInstance.put<AuthUserDto>("/auth/me/identity-document", form);
  return data;
}

export async function exportAccountData(): Promise<unknown> {
  const { data } = await axiosInstance.get<unknown>("/auth/me/export");
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

export async function updateCurrentUserPreferences(
  input: UpdateCurrentUserPreferencesDto,
): Promise<AuthUserDto> {
  const { data } = await axiosInstance.patch<AuthUserDto>(
    "/auth/me/preferences",
    input,
  );
  return data;
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
