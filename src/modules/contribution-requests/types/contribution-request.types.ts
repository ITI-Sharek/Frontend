export type ContributionRequestDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ContributionRequestStatus =
  | "draft"
  | "published"
  | "assigned"
  | "completed"
  | "cancelled"
  | "discarded";

export type ContributionRequestRequirementKind = "required" | "preferred";

export interface ContributionRequestRequirementDto {
  id: string;
  kind: ContributionRequestRequirementKind;
  position: number;
  text: string;
}

export interface ContributionRequestDto {
  id: string;
  projectId: string;
  title: string;
  description: string;
  requiredRequirements: ContributionRequestRequirementDto[];
  preferredRequirements: ContributionRequestRequirementDto[];
  technologyTags: string[];
  applicationsCloseTime: string | null;
  targetCompletionDate: string | null;
  difficulty: ContributionRequestDifficulty | null;
  reward: string | null;
  rewardCurrency: string | null;
  status: ContributionRequestStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Owner identity is intentionally absent. The backend derives it from the
 * bearer session and rejects unknown request properties.
 */
export interface ContributionRequestDraftPayload {
  title: string;
  description: string;
  requiredRequirements: Array<{ text: string }>;
  preferredRequirements: Array<{ text: string }>;
  technologyTags: string[];
  applicationsCloseTime: string;
  targetCompletionDate: string | null;
  difficulty: ContributionRequestDifficulty | null;
  reward: number | null;
  rewardCurrency: string | null;
}

export interface DiscardContributionRequestPayload {
  reason?: string;
}

export interface ContributionRequestFormState {
  title: string;
  description: string;
  requiredRequirements: string[];
  preferredRequirements: string[];
  technologyTags: string[];
  applicationsCloseTime: string;
  targetCompletionDate: string;
  difficulty: ContributionRequestDifficulty | "";
  reward: string;
  rewardCurrency: string;
}

export type ContributionRequestFormField =
  | "title"
  | "description"
  | "requiredRequirements"
  | "preferredRequirements"
  | "technologyTags"
  | "applicationsCloseTime"
  | "targetCompletionDate"
  | "difficulty"
  | "reward"
  | "rewardCurrency";

export type ContributionRequestFormErrors = Partial<
  Record<ContributionRequestFormField, string>
>;

export type ContributionRequestLocale = "ar" | "en";
