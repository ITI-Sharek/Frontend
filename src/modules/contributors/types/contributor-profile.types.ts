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

export interface ContributorGithubStatusDto {
  connected: boolean;
  username: string | null;
}

export type ContributorExperienceRange =
  | "zero_to_one"
  | "two_to_four"
  | "five_to_ten"
  | "ten_plus";

export interface ContributorFieldDto {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
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
  /** Self-declared profile data, distinct from the AI-verified `skills` list. */
  experienceRange: ContributorExperienceRange | null;
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
