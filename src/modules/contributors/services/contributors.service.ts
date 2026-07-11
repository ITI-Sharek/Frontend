import { isAxiosError } from "axios";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { ContributorProfileError } from "../types/contributor-profile.types";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

function normalizeContributorProfileError(error: unknown): never {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "تعذر تحميل ملف المساهم.";

    if (status === 401) {
      throw new ContributorProfileError(message, "unauthenticated");
    }
    if (status === 403) {
      throw new ContributorProfileError(message, "forbidden");
    }
    if (status === 404) {
      throw new ContributorProfileError(message, "not-found");
    }
    if (status === 409) {
      throw new ContributorProfileError(message, "duplicate-username");
    }
    if (status === 422 || status === 400) {
      throw new ContributorProfileError(message, "invalid-username");
    }
  }

  throw new ContributorProfileError("تعذر تحميل ملف المساهم.", "unavailable");
}

export async function getContributorProfileByUsername(
  username: string,
): Promise<ContributorProfileDto> {
  try {
    const { data } = await axiosInstance.get<ContributorProfileDto>(
      `/contributors/profiles/${encodeURIComponent(username)}`,
    );
    return data;
  } catch (error) {
    normalizeContributorProfileError(error);
  }
}

export async function ensureCurrentContributorProfile(): Promise<ContributorProfileDto> {
  try {
    const { data } = await axiosInstance.post<ContributorProfileDto>(
      "/contributors/profiles/me/ensure",
    );
    return data;
  } catch (error) {
    normalizeContributorProfileError(error);
  }
}
