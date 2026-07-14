export type SkillProfileGenerationStatus =
  | "queued"
  | "collecting_evidence"
  | "analyzing"
  | "pending_review"
  | "needs_more_evidence"
  | "failed";

export interface SkillProfileGenerationRepositorySelectionDto {
  fullName: string;
}

export interface StartSkillProfileGenerationPayload {
  repositories: SkillProfileGenerationRepositorySelectionDto[];
}

export interface SkillProfileGenerationSkillDto {
  id: string;
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
  confidence: number;
  status: "pending" | "approved" | "rejected" | "disputed" | "superseded";
  evidenceSummary: string | null;
}

export interface SkillProfileGenerationDto {
  generationId: string;
  status: SkillProfileGenerationStatus;
  progress: {
    selectedRepositoryCount: number;
    snapshottedRepositoryCount: number;
  };
  failureReason: string | null;
  selectedRepositories: SkillProfileGenerationRepositorySelectionDto[];
  skills: SkillProfileGenerationSkillDto[];
  fraudSignals: unknown[];
  evidenceQuality: string | null;
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  schemaVersion: string | null;
  serviceVersion: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
