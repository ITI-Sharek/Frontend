import { isAxiosError } from "axios";

import { API_BASE_URL } from "@/config/env";
import { axiosInstance } from "@/lib/axios/axios-instance";

import { ContributorProfileError } from "../types/contributor-profile.types";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

function normalizeContributorProfileError(error: unknown): never {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    // No response at all means the request never reached the backend
    // (server down, wrong VITE_API_URL, offline, CORS) — this is not an
    // auth/token problem, so don't lump it in with the generic message.
    if (status === undefined) {
      throw new ContributorProfileError(
        "تعذر الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي واتصالك بالإنترنت، ثم حاول مرة أخرى.",
        "unavailable",
      );
    }

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

/** Normalize older responses defensively while all environments migrate. */
type RawContributorProfileResponse = Omit<
  ContributorProfileDto,
  "experienceLevel" | "fields" | "declaredSkills"
> &
  Partial<
    Pick<
      ContributorProfileDto,
      "experienceLevel" | "fields" | "declaredSkills"
    >
  >;

function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl || !avatarUrl.startsWith("/")) return avatarUrl;
  return `${API_BASE_URL}${avatarUrl}`;
}

function normalizeContributorProfile(
  data: RawContributorProfileResponse,
): ContributorProfileDto {
  return {
    ...data,
    avatarUrl: resolveAvatarUrl(data.avatarUrl),
    experienceLevel: data.experienceLevel ?? null,
    fields: data.fields ?? [],
    declaredSkills: data.declaredSkills ?? [],
  };
}

export async function getContributorProfileByUsername(
  username: string,
): Promise<ContributorProfileDto> {
  try {
    const { data } = await axiosInstance.get<RawContributorProfileResponse>(
      `/contributors/profiles/${encodeURIComponent(username)}`,
    );
    return normalizeContributorProfile(data);
  } catch (error) {
    normalizeContributorProfileError(error);
  }
}

export async function ensureCurrentContributorProfile(): Promise<ContributorProfileDto> {
  try {
    const { data } = await axiosInstance.post<RawContributorProfileResponse>(
      "/contributors/profiles/me/ensure",
    );
    return normalizeContributorProfile(data);
  } catch (error) {
    normalizeContributorProfileError(error);
  }
}
