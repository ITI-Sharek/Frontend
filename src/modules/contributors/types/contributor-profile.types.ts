export type ViewerRelationship = "owner" | "authenticated-viewer";

export type ProfileViewState =
  | "loading"
  | "ready-owner"
  | "ready-authenticated-viewer"
  | "empty-sections"
  | "not-found"
  | "error";

export interface ContributorSkillDto {
  name: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
  confidence: number;
  status: "pending" | "approved" | "rejected" | "disputed";
  evidenceSummary: string | null;
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

/**
 * Legacy GitHub *identity* status (social login). It is NOT GitHub App
 * repository authorization and must never gate the skill-analysis flow.
 */
export interface ContributorGithubStatusDto {
  connected: boolean;
  username: string | null;
}

/**
 * Owner-only GitHub App installation summary. The backend returns an empty
 * array for any viewer that is not the profile owner.
 */
export interface ContributorGithubInstallationDto {
  installationLinkId: string;
  accountLogin: string;
  accountType: "user" | "organization";
  status: "active" | "disconnected" | "reauthorization_required" | "revoked";
  verifiedAt: string | null;
  manageUrl: string | null;
}

export interface ContributorFieldDto {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
}

export type ContributorExperienceLevelDto = ContributorFieldDto;

export interface ContributorProfileDto {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roleLabel: string;
  bio: string | null;
  skills: ContributorSkillDto[];
  availability: string | null;
  githubStatus: ContributorGithubStatusDto;
  /** Owner-only; empty for other viewers. Zero, one, or many links. */
  githubInstallations: ContributorGithubInstallationDto[];
  reputationSummary: ContributorReputationSummaryDto;
  contributionHistory: ContributorHistoryItemDto[];
  completionPrompts: string[];
  viewerRelationship: ViewerRelationship;
  /** Self-declared profile data, distinct from the AI-verified `skills` list. */
  experienceLevel: ContributorExperienceLevelDto | null;
  fields: ContributorFieldDto[];
  declaredSkills: string[];
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
