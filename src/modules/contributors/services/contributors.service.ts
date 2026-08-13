import { isAxiosError } from "axios";

import { API_BASE_URL } from "@/config/env";
import { axiosInstance } from "@/lib/axios/axios-instance";
import i18n from "@/lib/i18n";

import type {
  ContributorGithubInstallationDto,
  ContributorProfileDto,
} from "../types/contributor-profile.types";
import { ContributorProfileError } from "../types/contributor-profile.types";

function normalizeContributorProfileError(error: unknown): never {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    // No response at all means the request never reached the backend
    // (server down, wrong VITE_API_URL, offline, CORS) — this is not an
    // auth/token problem, so don't lump it in with the generic message.
    if (status === undefined) {
      throw new ContributorProfileError(
        i18n.t("contributor.errors.networkUnavailable"),
        "unavailable",
      );
    }

    const message =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : i18n.t("contributor.errors.profileLoadFailed");

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

  throw new ContributorProfileError(
    i18n.t("contributor.errors.profileLoadFailed"),
    "unavailable",
  );
}

/** Normalize older responses defensively while all environments migrate. */
type RawContributorProfileInstallation = Omit<
  ContributorGithubInstallationDto,
  "repositories"
> &
  Partial<Pick<ContributorGithubInstallationDto, "repositories">>;

type RawContributorProfileResponse = Omit<
  ContributorProfileDto,
  | "experienceLevel"
  | "fields"
  | "declaredSkills"
  | "githubInstallations"
  | "reputationSummary"
> &
  Partial<
    Pick<
      ContributorProfileDto,
      "experienceLevel" | "fields" | "declaredSkills"
    >
  > & {
    githubInstallations?: RawContributorProfileInstallation[];
    reputationSummary?: Partial<ContributorProfileDto["reputationSummary"]> &
      Pick<ContributorProfileDto["reputationSummary"], "rating" | "reviewsCount">;
  };

function resolveAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl || !avatarUrl.startsWith("/")) return avatarUrl;
  return `${API_BASE_URL}${avatarUrl}`;
}

function normalizeContributorProfile(
  data: RawContributorProfileResponse,
): ContributorProfileDto {
  const reputationSummary = data.reputationSummary;

  return {
    ...data,
    avatarUrl: resolveAvatarUrl(data.avatarUrl),
    experienceLevel: data.experienceLevel ?? null,
    fields: data.fields ?? [],
    declaredSkills: data.declaredSkills ?? [],
    githubInstallations: (data.githubInstallations ?? []).map(
      (installation) => ({
        ...installation,
        repositories: installation.repositories ?? [],
      }),
    ),
    reputationSummary: {
      rating: reputationSummary?.rating ?? null,
      reviewsCount: reputationSummary?.reviewsCount ?? 0,
      completedContributions: reputationSummary?.completedContributions ?? 0,
      totalAssignedTasks: reputationSummary?.totalAssignedTasks ?? 0,
      successRate: reputationSummary?.successRate ?? 0,
      topVerifiedSkills: reputationSummary?.topVerifiedSkills ?? [],
    },
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
