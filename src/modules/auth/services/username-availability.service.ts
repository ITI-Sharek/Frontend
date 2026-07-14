import { axiosInstance } from "@/lib/axios/axios-instance";

import type { UsernameAvailabilityResult } from "../types/auth.types";

const USERNAME_FORMAT_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/;

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_FORMAT_PATTERN.test(username);
}

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailabilityResult> {
  const trimmed = username.trim();

  if (!isValidUsernameFormat(trimmed)) {
    return { available: false, suggestion: null, reason: "invalid_format" };
  }

  const { data } = await axiosInstance.get<UsernameAvailabilityResult>(
    "/auth/username-availability",
    {
      params: {
        username: trimmed,
      },
    },
  );
  return data;
}
