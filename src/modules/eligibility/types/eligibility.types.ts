export type ProficiencyLevel = "beginner" | "intermediate" | "advanced";

/**
 * One reason a contributor cannot submit.
 *
 * `contributorLevel` is `null` when they hold no approved evidence for the
 * skill at all. That is a different situation from holding it too low and the
 * two are rendered differently, because the recovery advice differs: one person
 * needs to add evidence, the other needs to deepen it.
 */
export interface BlockingSkillDto {
  skillName: string;
  requiredLevel: ProficiencyLevel;
  contributorLevel: ProficiencyLevel | null;
}

export interface RequiredSkillRowDto extends BlockingSkillDto {
  met: boolean;
}

export interface EligibilityPreviewDto {
  contributionRequestId: string;
  outcome: "eligible" | "blocked";
  blockingSkills: BlockingSkillDto[];
  /** The whole bar, so a contributor sees what is asked, not only what failed. */
  requiredSkills: RequiredSkillRowDto[];
}

export type EligibilityGuidanceStatus = "pending" | "ready" | "failed";

export interface EligibilityGuidanceDto {
  id: string;
  eligibilityEvaluationId: string;
  status: EligibilityGuidanceStatus;
  /** Present in every status. Failure removes the narrative, never the reason. */
  blockingSkills: BlockingSkillDto[];
  narrative: string | null;
  recommendations: unknown;
  createdAt: string;
  updatedAt: string;
}
