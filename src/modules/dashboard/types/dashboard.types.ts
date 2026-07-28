/**
 * Contributor dashboard contract (WF-02). No backend endpoint exists yet —
 * `dashboard.service.ts` serves mock data with this exact shape; this file
 * is the handoff contract for `GET /contributors/dashboard`.
 */

/** WF-02 lifecycle states: A = active, B = onboarding, C = verified with zero applications. */
export type DashboardLifecycleState = "active" | "onboarding" | "verified-empty";

export interface AttentionItemDto {
  id: string;
  kind: "changes_requested" | "accepted";
  title: string;
  subtitle: string;
  actionLabel: string;
}

export interface MatchedTaskDto {
  id: string;
  title: string;
  projectName: string;
  requiredSkills: string[];
  matchedCount: number;
  requiredCount: number;
}

export interface GrowthSummaryDto {
  ratingPrevious: number | null;
  ratingCurrent: number | null;
  completedCount: number;
  successRate: number | null;
  skillsVerifiedThisMonth: number;
}

/**
 * DEC-030/036 removed AI eligibility as an Application gate: every
 * otherwise-valid Application lands directly in `pending_owner_review`, so
 * there is no separate "eligible" bucket to report here.
 */
export interface ApplicationsSummaryDto {
  pendingOwnerReviewCount: number;
}

export interface OnboardingStepDto {
  id: string;
  label: string;
  status: "done" | "in_progress" | "todo";
  hint: string | null;
}

export interface QuotaDto {
  planName: string;
  usedToday: number;
  dailyLimit: number;
}

export interface ContributorDashboardDto {
  state: DashboardLifecycleState;
  greetingName: string;
  unreadNotifications: number;
  quota: QuotaDto;
  /** State A: items needing the contributor's action, most urgent first. */
  attentionItems: AttentionItemDto[];
  /** State A: why these tasks matched (verified skills), shown next to the section title. */
  matchReason: string;
  matchedTasks: MatchedTaskDto[];
  growth: GrowthSummaryDto;
  applications: ApplicationsSummaryDto;
  /** State B only. */
  onboardingSteps: OnboardingStepDto[];
  /** State C only: count for the "N tasks fully match you today" hero. */
  fullyMatchedTasksCount: number;
}
