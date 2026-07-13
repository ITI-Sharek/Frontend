/**
 * Contribution-task contracts (CJ-2/3/4 · WF-05/06/12 · state-model §4).
 * Mock-first; future endpoints: GET /tasks · GET /tasks/:id ·
 * POST /tasks/:id/applications (quota consumed when validation starts,
 * DEC-006; fit hints per DEC-010 — buckets, never percentages).
 */

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export type FitBucket = "strong" | "partial" | "low" | "unknown";

export interface TaskFitHintDto {
  bucket: FitBucket;
  matchedCount: number;
  requiredCount: number;
  reason: string;
}

export interface TaskCardDto {
  id: string;
  title: string;
  projectName: string;
  projectSlug: string;
  requiredTechnologies: string[];
  difficulty: ProjectDifficulty;
  deadlineLabel: string | null;
  rewardLabel: string | null;
  applicantsLabel: string;
  fitHint: TaskFitHintDto | null;
}

export interface RequirementMatchDto {
  technology: string;
  verified: boolean;
  proficiencyLabel: string | null;
}

export type TaskApplicationState =
  | "open"
  | "already_applied"
  | "assigned"
  | "quota_exhausted"
  | "profile_not_approved";

export interface TaskDetailsDto extends TaskCardDto {
  description: string;
  maxApplicants: number;
  requirements: RequirementMatchDto[];
  applicationState: TaskApplicationState;
  quota: { used: number; dailyLimit: number };
}

export type ValidationDecision = "eligible" | "ineligible" | "review_needed";

export interface ValidationResultDto {
  decision: ValidationDecision;
  confidenceBand: "high" | "moderate" | "low";
  justification: string;
  matched: string[];
  missing: string[];
  evidenceRefs: string[];
  /** Forward paths for the ineligible screen (Principle 5). */
  alternatives: TaskCardDto[];
}

export interface TaskFeedFiltersDto {
  q?: string;
  technologies?: string[];
  difficulty?: ProjectDifficulty;
  hasReward?: boolean;
}
