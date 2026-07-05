import { axiosInstance } from "@/lib/axios/axios-instance";

import type { AuthSessionDto, RegisterPayload } from "../types/auth.types";

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSessionDto> {
  const { data } = await axiosInstance.post<AuthSessionDto>(
    "/auth/register",
    payload,
  );
  return data;
}
