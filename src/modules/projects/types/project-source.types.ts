/**
 * Shared safe GitHub repository source shapes (SK-112 contract, shared
 * "Shared Safe Source Types" section). Owner-visible only; public DTOs use
 * their own narrower shape (see public-project.types.ts). Never includes
 * installation ID, App target ID, permissions, tokens, scopes, provider
 * request IDs, or raw provider objects.
 */

export type ProjectSourceProvider = "github";
export type ProjectRepositoryVisibility = "public" | "private";
export type ProjectRepositoryOwnerType = "user" | "organization" | "unknown";

/**
 * `repositoryId`/`defaultBranch`/`sourceUpdatedAt`/`fetchedAt` are nullable
 * because a reconciled legacy owner row may not have every identity field
 * verified yet (`ProjectOwnerViewDto.source.attribution` on the backend).
 * `fullName`/`repositoryUrl`/`visibility`/`ownerType` remain required.
 */
export interface ProjectSourceAttributionDto {
  provider: ProjectSourceProvider;
  repositoryId: string | null;
  fullName: string;
  repositoryUrl: string;
  visibility: ProjectRepositoryVisibility;
  ownerType: ProjectRepositoryOwnerType;
  defaultBranch: string | null;
  sourceVersion: string | null;
  sourceUpdatedAt: string | null;
  fetchedAt: string | null;
}

export type ProjectSourceSyncStatus =
  | "fresh"
  | "stale"
  | "refreshing"
  | "partial"
  | "failed"
  | "authorization_revoked";

export type ProjectSourceAuthorizationStatus =
  | "public_read"
  | "authorized"
  | "authorization_required"
  | "revoked"
  | "unknown";

export type ProjectSourceSelectionStatus =
  | "not_required"
  | "selected"
  | "unselected"
  | "revoked"
  | "unknown";

export type ProjectSourceInvalidationReason =
  | "authorization_revoked"
  | "repository_unselected"
  | "ownership_transferred"
  | "repository_deleted"
  | "visibility_changed"
  | "equivalent_source_change";

/** Safe application recovery action code; copy is resolved from this string. */
export type ProjectSourceRecoveryAction = string;

export interface ProjectSourceStatusDto {
  syncStatus: ProjectSourceSyncStatus;
  authorizationStatus: ProjectSourceAuthorizationStatus;
  selectionStatus: ProjectSourceSelectionStatus;
  lastAttemptAt: string | null;
  lastRequiredReadAt: string | null;
  freshUntil: string | null;
  isStale: boolean;
  invalidationReason: ProjectSourceInvalidationReason | null;
  lastSuccessfulRefreshAt: string | null;
  unavailableAreas: string[];
  recoveryAction: ProjectSourceRecoveryAction | null;
}

export type ProjectSourceCompleteness = "complete" | "partial";

/** Per-area adoption state for one imported evidence snapshot. */
export type ProjectSourceFieldStatus =
  | "updated"
  | "unchanged"
  | "retained_stale"
  | "unavailable"
  | "not_provided";

export interface ProjectSourceSnapshotDto {
  /** Absent until the backend's append-only snapshot record exists for this
   * adoption (see `data-model.md` `ProjectSourceSnapshot.id`). */
  evidenceId?: string;
  description: string | null;
  languages: Record<string, number> | null;
  topics: string[] | null;
  technologies: string[] | null;
  statistics: Record<string, number | string | null> | null;
  readmeContent: string | null;
  completeness: ProjectSourceCompleteness;
  fieldStatus: Record<string, ProjectSourceFieldStatus>;
  uncertainty: string[];
}
