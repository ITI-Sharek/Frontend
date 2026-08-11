import { z } from "zod";

const selectionSchema = z.object({
  materialId: z.string(),
  version: z.number().int().positive(),
  originalFilename: z.string(),
  mimeType: z.string(),
  contentHash: z.string(),
});

const suggestionSchema = z.object({
  id: z.string(),
  type: z.enum(["PROJECT_UPDATE", "CONTRIBUTION_REQUEST"]),
  targetField: z.string().nullable(),
  payload: z.unknown(),
  rationale: z.string(),
  sourceVersions: z.array(z.object({ materialId: z.string(), version: z.number().int().positive() })),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
  reviewedAt: z.string().nullable(),
  sourceRemovedAt: z.string().nullable(),
  adoptedEntityType: z.string().nullable(),
  adoptedEntityId: z.string().nullable(),
  createdAt: z.string(),
});

export const materialAnalysisSetSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  ownerId: z.string(),
  purpose: z.literal("PROJECT_MATERIAL_DRAFTING"),
  status: z.enum(["DRAFT", "RUNNING", "COMPLETED", "FAILED"]),
  materialVersions: z.array(selectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const materialAnalysisSetListSchema = z.array(materialAnalysisSetSchema);

export const materialAnalysisRunSchema = z.object({
  id: z.string(),
  analysisSetId: z.string(),
  contractVersion: z.literal("material-draft-v1"),
  status: z.enum(["REQUESTED", "RUNNING", "COMPLETED", "FAILED"]),
  provider: z.string().nullable(),
  model: z.string().nullable(),
  promptVersion: z.string().nullable(),
  schemaVersion: z.string().nullable(),
  serviceVersion: z.string().nullable(),
  documentCount: z.number().int().nullable(),
  extractedCharacters: z.number().int().nullable(),
  errorCode: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  suggestions: z.array(suggestionSchema),
});

export const materialAnalysisConstraintsSchema = z.object({
  maxDocuments: z.number().int().positive(),
  maxExtractedCharacters: z.number().int().positive(),
  supportedMimeTypes: z.array(z.string()).min(1),
});
