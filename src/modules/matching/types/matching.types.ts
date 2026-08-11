import type { SubscriptionPlan } from "@/modules/subscriptions";

export type MatchingConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface MatchedSkillDto {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
  evidenceIds: string[];
}

export interface ContributorMatchDto {
  contributorId: string;
  contributorName: string;
  contributorUsername: string | null;
  matchScore: number;
  confidence: MatchingConfidence;
  justification: string;
  matchedSkills: MatchedSkillDto[];
  evidenceIds: string[];
  rank: number;
}

export interface OwnerMatchesResponseDto {
  requestId: string;
  planType: SubscriptionPlan;
  resultLimit: 0 | 5 | 10;
  status: "completed" | "no_candidates" | "system_limit";
  matches: ContributorMatchDto[];
}

export interface InviteMatchedContributorResponseDto {
  requestId: string;
  contributorId: string;
  notificationId: string;
  created: boolean;
}

export interface RecommendedTaskDto {
  requestId: string;
  projectName: string;
  title: string;
  matchScore: number;
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
