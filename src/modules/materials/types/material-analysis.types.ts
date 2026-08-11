export type MaterialAnalysisSetStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";
export type MaterialAnalysisRunStatus = "REQUESTED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface MaterialAnalysisSelection {
  materialId: string;
  version: number;
  originalFilename: string;
  mimeType: string;
  contentHash: string;
}

export interface MaterialAnalysisSet {
  id: string;
  projectId: string;
  ownerId: string;
  purpose: "PROJECT_MATERIAL_DRAFTING";
  status: MaterialAnalysisSetStatus;
  materialVersions: MaterialAnalysisSelection[];
  createdAt: string;
  updatedAt: string;
}

export interface MaterialDraftSuggestion {
  id: string;
  type: "PROJECT_UPDATE" | "CONTRIBUTION_REQUEST";
  targetField: string | null;
  payload: unknown;
  rationale: string;
  sourceVersions: Array<{ materialId: string; version: number }>;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  reviewedAt: string | null;
  sourceRemovedAt: string | null;
  adoptedEntityType: string | null;
  adoptedEntityId: string | null;
  createdAt: string;
}

export interface MaterialAnalysisRun {
  id: string;
  analysisSetId: string;
  contractVersion: "material-draft-v1";
  status: MaterialAnalysisRunStatus;
  provider: string | null;
  model: string | null;
  promptVersion: string | null;
  schemaVersion: string | null;
  serviceVersion: string | null;
  documentCount: number | null;
  extractedCharacters: number | null;
  errorCode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  suggestions: MaterialDraftSuggestion[];
}

export interface MaterialAnalysisConstraints {
  maxDocuments: number;
  maxExtractedCharacters: number;
  supportedMimeTypes: string[];
}
