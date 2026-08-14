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

export interface RecommendedTasksResponseDto {
  planType: SubscriptionPlan;
  recommendations: RecommendedTaskDto[];
}
