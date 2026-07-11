export type ViewerRelationship = "owner" | "authenticated-viewer";

export type ProfileViewState =
  | "loading"
  | "ready-owner"
  | "ready-authenticated-viewer"
  | "empty-sections"
  | "not-found"
  | "error";

export interface ContributorSkillDto {
  id: string;
  name: string;
}

export interface ContributorHistoryItemDto {
  id: string;
  title: string;
  description: string | null;
  role: string | null;
}

export interface ContributorReputationSummaryDto {
  rating: number | null;
  reviewsCount: number;
}

export interface ContributorGithubStatusDto {
  connected: boolean;
  username: string | null;
}

export interface ContributorProfileDto {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roleLabel: string;
  bio: string | null;
  skills: ContributorSkillDto[];
  availability: string | null;
  githubStatus: ContributorGithubStatusDto;
  reputationSummary: ContributorReputationSummaryDto;
  contributionHistory: ContributorHistoryItemDto[];
  completionPrompts: string[];
  viewerRelationship: ViewerRelationship;
}

export class ContributorProfileError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "duplicate-username"
      | "invalid-username"
      | "not-found"
      | "unauthenticated"
      | "forbidden"
      | "unavailable",
  ) {
    super(message);
    this.name = "ContributorProfileError";
  }
}
