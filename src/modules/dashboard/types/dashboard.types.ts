/**
 * Contributor dashboard contract returned by `GET /contributors/me/dashboard`.
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
  /** What the request asks for. The gauge's denominator, named. */
  requiredSkills: string[];
  /** Which of the contributor's approved skills fit it. */
  matchedSkills: string[];
  /**
   * The gauge, as two counts of the required bar. These were the same number
   * until the backend carried a real denominator, which drew every match as a
   * complete one regardless of fit.
   */
  matchedCount: number;
  requiredCount: number;
}

/**
 * The plan behind the matched list, and why it is empty when it is.
 *
 * Matched projects are a Gold benefit, so an empty list has two very different
 * causes: a free contributor (who should see what the plan buys) and a Gold
 * contributor with nothing matching today (who should not be sold anything).
 */
export interface DashboardMatchingDto {
  planType: "free" | "gold";
  reason:
    | "MATCHING_REQUIRES_SUBSCRIPTION"
    | "NO_APPROVED_SKILLS"
    | "NO_MATCHING_REQUESTS"
    | null;
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
  matching: DashboardMatchingDto;
  growth: GrowthSummaryDto;
  applications: ApplicationsSummaryDto;
  /** State B only. */
  onboardingSteps: OnboardingStepDto[];
  /** State C only: count for the "N tasks fully match you today" hero. */
  fullyMatchedTasksCount: number;
}
