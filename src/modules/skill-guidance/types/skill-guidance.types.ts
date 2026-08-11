export interface SkillGapGuidanceMissingSkillDto {
  requirementId: string;
  skillName: string;
  gap: "not_evidenced" | "below_target_proficiency";
  explanation: string;
  evidenceIds: string[];
  uncertainty: string[];
}

export interface SkillGapGuidanceLearningResourceDto {
  title: string;
  resourceType: "documentation" | "course" | "tutorial" | "book" | "reference";
  url: string;
  rationale: string;
  evidenceIds: string[];
}

export interface SkillGapGuidancePracticeProjectDto {
  title: string;
  description: string;
  technologies: string[];
  evidenceIds: string[];
}

export interface SkillGapGuidanceImprovementStepDto {
  step: string;
  focus: string;
  estimatedDuration: string | null;
  evidenceIds: string[];
}

export interface SkillGapGuidanceResultDto {
  kind: "no_assessable_evidence" | "system_limit" | "completed";
  missingSkills?: SkillGapGuidanceMissingSkillDto[];
  recommendedTechnologies?: Array<{
    name: string;
    rationale: string;
    evidenceIds: string[];
  }>;
  learningResources?: SkillGapGuidanceLearningResourceDto[];
  practiceProjects?: SkillGapGuidancePracticeProjectDto[];
  improvementPath?: SkillGapGuidanceImprovementStepDto[];
  sources?: Array<{
    evidenceId: string;
    label: string;
    type: "approved_skill" | "contribution_requirement" | "curated_learning_resource";
  }>;
}
