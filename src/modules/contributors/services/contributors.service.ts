import { isAxiosError } from "axios";

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

/**
 * The backend doesn't send experienceLevel/interests/declaredSkills yet (no
 * Prisma column — see docs/design/api-contract-additions.md §3), so the raw
 * response can't be trusted to match ContributorProfileDto's declared shape.
 * `RawContributorProfileResponse` reflects that reality; normalize fills the
 * defaults so the rest of the app can rely on the DTO's declared shape
 * instead of every consumer defensively optional-chaining.
 */
type RawContributorProfileResponse = Omit<
  ContributorProfileDto,
  "experienceLevel" | "interests" | "declaredSkills"
> &
  Partial<
    Pick<
      ContributorProfileDto,
      "experienceLevel" | "interests" | "declaredSkills"
    >
  >;

function normalizeContributorProfile(
  data: RawContributorProfileResponse,
): ContributorProfileDto {
  return {
    ...data,
    experienceLevel: data.experienceLevel ?? null,
    interests: data.interests ?? [],
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
