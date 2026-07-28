import type { ApplicationStatus } from "../types/application.types";
import type { ContributionRequestFeedFiltersDto } from "../types/contribution-request.types";

export const contributionRequestKeys = {
  all: ["contribution-requests"] as const,
  detail: (requestId: string) =>
    [...contributionRequestKeys.all, "detail", requestId] as const,
};

const CONTRIBUTION_REQUESTS_ROOT = ["contribution-requests"] as const;
const APPLICATIONS_ROOT = ["applications"] as const;

export const contributionRequestsQueryKeys = {
  all: CONTRIBUTION_REQUESTS_ROOT,
  feed: (filters: ContributionRequestFeedFiltersDto = {}) =>
    [...CONTRIBUTION_REQUESTS_ROOT, "feed", filters] as const,
  details: (contributionRequestId: string) =>
    [...CONTRIBUTION_REQUESTS_ROOT, "details", contributionRequestId] as const,
  ownerApplications: (contributionRequestId: string) =>
    [
      ...CONTRIBUTION_REQUESTS_ROOT,
      "owner-applications",
      contributionRequestId,
    ] as const,
};

export const applicationsQueryKeys = {
  all: APPLICATIONS_ROOT,
  mine: (status?: ApplicationStatus) =>
    [...APPLICATIONS_ROOT, "mine", status ?? null] as const,
};
