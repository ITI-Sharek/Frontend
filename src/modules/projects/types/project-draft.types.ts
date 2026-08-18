import type {
  ProjectCategory,
  ProjectDifficulty,
  ProjectStatus,
} from "./project.types";
import type {
  ProjectSourceAttributionDto,
  ProjectSourceAuthorizationStatus,
  ProjectSourceCompleteness,
  ProjectSourceSelectionStatus,
  ProjectSourceSnapshotDto,
  ProjectSourceStatusDto,
} from "./project-source.types";

/**
 * GitHub-backed project draft/publication contract (SK-112,
 * `server/specs/003-github-project-publication/contracts/http-api.md`).
 * Retires the combined `POST /projects/import/github` route.
 */

export type ProjectManualOverrideField =
  | "title"
  | "description"
  | "tags"
  | "technologies";

export interface PreviewGitHubRepositoryPayload {
  repositoryReference: string;
}

export interface PreviewImportedMetadataDto {
  repositoryName: string;
  description: string | null;
  languages: Record<string, number>;
  topics: string[];
  technologies: string[];
  statistics: Record<string, number | string | null>;
  readmeContent: string | null;
}

export interface PreviewOwnerDefaultsDto {
  title: string;
  description: string | null;
  tags: string[];
  technologies: string[];
}

export interface PreviewEvidenceDto {
  completeness: ProjectSourceCompleteness;
  fieldStatus: Record<string, string>;
  unavailableAreas: string[];
  authorizationStatus: ProjectSourceAuthorizationStatus;
  selectionStatus: ProjectSourceSelectionStatus;
}

export interface PreviewGitHubRepositoryResponseDto {
  previewFingerprint: string;
  source: ProjectSourceAttributionDto;
  imported: PreviewImportedMetadataDto;
  ownerDefaults: PreviewOwnerDefaultsDto;
  evidence: PreviewEvidenceDto;
}

export interface CreateProjectDraftPayload {
  source: {
    provider: "github";
    repositoryReference: string;
    previewFingerprint: string;
  };
  project: {
    title?: string;
    description?: string | null;
    tags?: string[];
    technologies?: string[];
    category?: ProjectCategory | null;
    difficulty?: ProjectDifficulty | null;
  };
}

export interface ProjectOwnerEffectiveFieldsDto {
  title: string;
  description: string | null;
  tags: string[];
  technologies: string[];
    category: ProjectCategory | null;
    difficulty: ProjectDifficulty | null;
    heroImageUrl: string | null;
    manualOverrides: ProjectManualOverrideField[];
}

export interface ProjectOwnerViewDto {
  id: string;
  slug: string;
  status: ProjectStatus;
  revision: number;
  project: ProjectOwnerEffectiveFieldsDto;
  source: {
    attribution: ProjectSourceAttributionDto;
    latestSnapshot: ProjectSourceSnapshotDto | null;
    status: ProjectSourceStatusDto;
  };
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EditProjectPayload {
  expectedRevision: number;
  title?: string;
  description?: string | null;
  tags?: string[];
  technologies?: string[];
  category?: ProjectCategory | null;
  difficulty?: ProjectDifficulty | null;
  restoreFromSource?: ProjectManualOverrideField[];
}

export interface RefreshProjectSourcePayload {
  expectedRevision: number;
}

export interface UploadProjectHeroImagePayload {
  expectedRevision: number;
  file: File;
}

export interface PublishProjectPayload {
  expectedRevision: number;
  confirm: true;
}

export interface ArchiveProjectPayload {
  expectedRevision: number;
  confirm: true;
}

export interface ProjectTransitionResultDto {
  projectId: string;
  status: ProjectStatus;
  revision: number;
  publishedAt?: string | null;
  archivedAt?: string | null;
  transitionId: string;
}

/** Error `code` values from the contract's error matrix. */
export type ProjectApiErrorCode =
  | "GITHUB_REPOSITORY_REFERENCE_INVALID"
  | "PROJECT_REQUEST_INVALID"
  | "PROJECT_ACCOUNT_NOT_ELIGIBLE"
  | "GITHUB_SOURCE_NOT_AVAILABLE"
  | "PROJECT_NOT_FOUND"
  | "PROJECT_REVISION_CONFLICT"
  | "PROJECT_IDEMPOTENCY_KEY_REUSED"
  | "PROJECT_SOURCE_CHANGED_SINCE_PREVIEW"
  | "PROJECT_REPOSITORY_ALREADY_PUBLISHED"
  | "PROJECT_STATE_TRANSITION_INVALID"
  | "PROJECT_IMPORT_ROUTE_RETIRED"
  | "PROJECT_PUBLICATION_INCOMPLETE"
  | "PROJECT_HERO_IMAGE_REQUIRED"
  | "PROJECT_HERO_IMAGE_INVALID"
  | "PROJECT_HERO_IMAGE_NOT_FOUND"
  | "PROJECT_REPOSITORY_CONTROL_REQUIRED"
  | "PROJECT_SOURCE_AUTHORIZATION_REQUIRED"
  | "GITHUB_RATE_LIMITED"
  | "PROJECT_PUBLICATION_RECONCILIATION_REQUIRED"
  | "GITHUB_PROVIDER_UNAVAILABLE"
  | "GITHUB_PROVIDER_INVALID_RESPONSE"
  | "GITHUB_PROVIDER_TIMEOUT";
