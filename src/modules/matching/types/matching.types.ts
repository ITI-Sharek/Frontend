import type { SubscriptionPlan } from "@/modules/subscriptions";

export type MatchingConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface MatchedSkillDto {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
  evidenceIds: string[];
}

export interface RecommendedTaskDto {
  requestId: string;
  projectName: string;
  title: string;
  /**
   * Ordinal position only. Ranking is never presented as a score or a
   * percentage (DEC-010); `confidence` is the categorical signal shown to the
   * contributor.
   */
  rank: number;
  confidence: MatchingConfidence;
  justification: string;
  matchedSkills: MatchedSkillDto[];
  applicationsCloseAt: string;
  targetCompletionDate: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  reward: number | null;
  rewardCurrency: string | null;
}

/**
 * Why the list came back empty. `MATCHING_REQUIRES_SUBSCRIPTION` arrives with a
 * `200`, not a `403`: the route is legitimately a free contributor's, the
 * answer is simply empty until they subscribe. Reading it as an error would
 * put an error state where an upgrade prompt belongs.
 */
export type RecommendedTasksReason =
  | "MATCHING_REQUIRES_SUBSCRIPTION"
  | "NO_APPROVED_SKILLS"
  | "NO_MATCHING_REQUESTS";

export interface RecommendedTasksResponseDto {
  planType: SubscriptionPlan;
  recommendations: RecommendedTaskDto[];
  /** Present only when `recommendations` is empty. */
  reason: RecommendedTasksReason | null;
}
