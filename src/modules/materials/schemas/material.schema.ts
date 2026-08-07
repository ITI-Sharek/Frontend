import { z } from "zod";

const materialVersionSchema = z.object({
  version: z.number().int().positive(),
  scanStatus: z.enum(["QUARANTINED", "SCANNING", "READY", "REJECTED"]),
  scanErrorCode: z.string().nullable(),
  byteSize: z.number().int().nonnegative(),
  mimeType: z.string(),
  originalFilename: z.string(),
  contentHash: z.string(),
  uploadedAt: z.string(),
  scannedAt: z.string().nullable(),
  purgedAt: z.string().nullable(),
});

export const materialSchema = z.object({
  id: z.string(),
  projectId: z.string().nullable(),
  contributionRequestId: z.string().nullable(),
  ownerId: z.string(),
  title: z.string(),
  visibility: z.enum(["PUBLIC", "RESTRICTED_PROJECT", "ASSIGNMENT"]),
  currentVersion: z.number().int().nonnegative(),
  versions: z.array(materialVersionSchema),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const materialListSchema = z.array(materialSchema);

export const materialGrantSchema = z.object({
  granteeId: z.string(),
  granteeName: z.string(),
  granteeUsername: z.string().nullable(),
  grantedBy: z.string(),
  grantedAt: z.string(),
  revokedAt: z.string().nullable(),
  revokedBy: z.string().nullable(),
});

export const materialGrantListSchema = z.array(materialGrantSchema);

export const materialUploadConstraintsSchema = z.object({
  // Parsed rather than trusted, because the upload form states these numbers
  // to the user and then enforces them client-side. A malformed response that
  // silently became NaN would present no limit at all.
  maxBytes: z.number().int().positive(),
  allowedMimeTypes: z.array(z.string()).min(1),
});

export const materialDownloadTokenSchema = z.object({
  token: z.string().min(1),
  version: z.number().int().positive(),
  expiresAt: z.string(),
});

export const materialDeletionSchema = z.object({
  materialId: z.string(),
  purgedVersions: z.number().int().nonnegative(),
});
