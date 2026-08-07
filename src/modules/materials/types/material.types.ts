export type MaterialVisibility =
  | "PUBLIC"
  | "RESTRICTED_PROJECT"
  | "ASSIGNMENT";

export type MaterialScanStatus =
  | "QUARANTINED"
  | "SCANNING"
  | "READY"
  | "REJECTED";

export interface MaterialVersionDto {
  version: number;
  scanStatus: MaterialScanStatus;
  /**
   * Why a version is not READY, when the server has something to say. It is
   * what separates "waiting to be scanned" from "we tried and never got a
   * verdict" — two situations that share the QUARANTINED status and need
   * opposite things said about them.
   */
  scanErrorCode: string | null;
  byteSize: number;
  mimeType: string;
  originalFilename: string;
  contentHash: string;
  uploadedAt: string;
  scannedAt: string | null;
  purgedAt: string | null;
}

export interface MaterialDto {
  id: string;
  projectId: string | null;
  contributionRequestId: string | null;
  ownerId: string;
  title: string;
  visibility: MaterialVisibility;
  currentVersion: number;
  versions: MaterialVersionDto[];
  /** Set only in an owner's own listing, where a deleted Material is shown. */
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialGrantDto {
  granteeId: string;
  granteeName: string;
  granteeUsername: string | null;
  grantedBy: string;
  grantedAt: string;
  revokedAt: string | null;
  revokedBy: string | null;
}

export interface MaterialUploadConstraintsDto {
  maxBytes: number;
  allowedMimeTypes: string[];
}

export interface MaterialDownloadTokenDto {
  token: string;
  version: number;
  expiresAt: string;
}

export interface MaterialDeletionDto {
  materialId: string;
  purgedVersions: number;
}

export interface UploadMaterialPayload {
  file: File;
  title: string;
  visibility: MaterialVisibility;
  idempotencyKey: string;
}
