/**
 * Canonical Contribution Request and Requirement contracts
 * (`docs/architecture/domain-model/CONTRIBUTION_REQUEST.md`,
 * `docs/architecture/contracts/api-contract-additions.md` §5). Deliberately
 * excludes application-attempt quotas, automatic validation, eligibility
 * verdicts, and admin-review concepts carried by the superseded task mock.
 */

export type ContributionRequestDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

/**
 * `discarded` is a private, pre-publish-only terminal state owned by the
 * draft lifecycle (backend issue #48); it is additive to the published
 * lifecycle enum in the domain model, not a replacement for `cancelled`.
 */
export type ContributionRequestStatus =
  | "draft"
  | "published"
  | "assigned"
  | "in_progress"
  | "awaiting_delivery"
  | "delivery_submitted"
  | "completed"
  | "cancelled"
  | "expired"
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

export interface CancelContributionRequestPayload {
  reason?: string;
}

/**
 * The backend Prisma enum currently persists only these six statuses;
 * `in_progress`, `awaiting_delivery`, and `expired` above are not yet
 * reachable and are excluded from the owner workspace grouping.
 */
export type ContributionRequestsByStatusDto = Record<
  Exclude<
    ContributionRequestStatus,
    "in_progress" | "awaiting_delivery" | "delivery_submitted" | "expired"
  >,
  ContributionRequestDto[]
>;

export interface OwnerProjectContributionRequestsDto {
  projectId: string;
  totalCount: number;
  byStatus: ContributionRequestsByStatusDto;
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

export type RequirementClassification = "required" | "preferred";

export interface RequirementDto {
  id: string;
  text: string;
  classification: RequirementClassification;
}

export interface ContributionRequestRewardDto {
  amount: number;
  currency: string;
}

export interface ContributionRequestListItemDto {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  title: string;
  technologyTags: string[];
  difficulty: ContributionRequestDifficulty | null;
  applicationsCloseAt: string | null;
  targetCompletionDate: string | null;
  reward: ContributionRequestRewardDto | null;
}

export interface ContributionRequestDetailDto
  extends ContributionRequestListItemDto {
  description: string;
  status: ContributionRequestStatus;
  requirements: RequirementDto[];
}

export interface ContributionRequestFeedFiltersDto {
  q?: string;
  technologies?: string[];
  difficulty?: ContributionRequestDifficulty;
  hasReward?: boolean;
}

export interface ContributionRequestFeedResponseDto {
  items: ContributionRequestListItemDto[];
  totalCount: number;
  technologyFacets: string[];
}
