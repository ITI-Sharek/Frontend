export type SkillProfileGenerationStatus =
  | "queued"
  | "collecting_evidence"
  | "analyzing"
  | "pending_review"
  | "needs_more_evidence"
  | "failed";

export interface SkillProfileGenerationRepositorySelectionDto {
  repositoryId: string;
  fullName: string;
}

export interface SkillProfileAnalysisConsentPayload {
  accepted: boolean;
  version: string;
}

export interface StartSkillProfileGenerationPayload {
  installationLinkId: string;
  /** Immutable GitHub repository IDs, never full names. */
  repositoryIds: string[];
  consent: SkillProfileAnalysisConsentPayload;
}

export interface RetrySkillProfileGenerationPayload {
  generationId: string;
  /** Retry always requires fresh explicit consent. */
  consent: SkillProfileAnalysisConsentPayload;
}

export interface SkillProfileGenerationSkillDto {
  id: string;
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
  confidence: number;
  status: "pending" | "approved" | "rejected" | "disputed" | "superseded";
  evidenceSummary: string | null;
}

export interface SkillProfileGenerationProgressDto {
  selectedRepositoryCount: number;
  snapshottedRepositoryCount: number;
}

export interface SkillProfileGenerationDto {
  generationId: string;
  status: SkillProfileGenerationStatus;
  progress: SkillProfileGenerationProgressDto;
  failureReason: string | null;
  installationLinkId: string | null;
  providerInstallationId: string | null;
  consentVersion: string | null;
  consentedAt: string | null;
  authorizationVerifiedAt: string | null;
  retryOfGenerationId: string | null;
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
