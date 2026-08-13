import type { TFunction } from "i18next";
import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type {
  ProjectRepositoryOwnerType,
  ProjectSourceAuthorizationStatus,
  ProjectSourceSelectionStatus,
  ProjectSourceStatusDto,
  ProjectSourceSyncStatus,
} from "../types/project-source.types";

interface SourceStatusMeta {
  label: string;
  tone: StatusChipTone;
}

const SYNC_STATUS_TONE: Record<ProjectSourceSyncStatus, StatusChipTone> = {
  fresh: "positive",
  stale: "attention",
  refreshing: "waiting",
  partial: "attention",
  failed: "negative",
  authorization_revoked: "negative",
};

const SYNC_STATUS_LABEL_KEYS: Record<ProjectSourceSyncStatus, string> = {
  fresh: "project.source.fresh",
  stale: "project.source.stale",
  refreshing: "project.source.refreshing",
  partial: "project.source.partial",
  failed: "project.source.failed",
  authorization_revoked: "project.source.authorizationRevoked",
};

const AUTHORIZATION_STATUS_TONE: Record<
  ProjectSourceAuthorizationStatus,
  StatusChipTone
> = {
  public_read: "neutral",
  authorized: "positive",
  authorization_required: "attention",
  revoked: "negative",
  unknown: "neutral",
};

const AUTHORIZATION_STATUS_LABEL_KEYS: Record<
  ProjectSourceAuthorizationStatus,
  string
> = {
  public_read: "project.source.publicRead",
  authorized: "project.source.authorized",
  authorization_required: "project.source.authorizationRequired",
  revoked: "project.source.authorizationRevoked",
  unknown: "project.source.unknown",
};

const SELECTION_STATUS_TONE: Record<
  ProjectSourceSelectionStatus,
  StatusChipTone
> = {
  not_required: "neutral",
  selected: "positive",
  unselected: "attention",
  revoked: "negative",
  unknown: "neutral",
};

const SELECTION_STATUS_LABEL_KEYS: Record<
  ProjectSourceSelectionStatus,
  string
> = {
  not_required: "project.source.selectionNotRequired",
  selected: "project.source.selected",
  unselected: "project.source.unselected",
  revoked: "project.source.selectionRevoked",
  unknown: "project.source.unknown",
};

const OWNER_TYPE_LABEL_KEYS: Record<ProjectRepositoryOwnerType, string> = {
  organization: "project.source.ownerTypeOrganization",
  user: "project.source.ownerTypeUser",
  unknown: "project.source.ownerTypeUnknown",
};

export function getOwnerTypeLabel(
  t: TFunction,
  ownerType: ProjectRepositoryOwnerType,
): string {
  return t(OWNER_TYPE_LABEL_KEYS[ownerType]);
}

export function getSourceSyncStatusMeta(
  t: TFunction,
  status: ProjectSourceSyncStatus,
): SourceStatusMeta {
  return {
    label: t(SYNC_STATUS_LABEL_KEYS[status]),
    tone: SYNC_STATUS_TONE[status],
  };
}

export function getSourceAuthorizationStatusMeta(
  t: TFunction,
  status: ProjectSourceAuthorizationStatus,
): SourceStatusMeta {
  return {
    label: t(AUTHORIZATION_STATUS_LABEL_KEYS[status]),
    tone: AUTHORIZATION_STATUS_TONE[status],
  };
}

export function getSourceSelectionStatusMeta(
  t: TFunction,
  status: ProjectSourceSelectionStatus,
): SourceStatusMeta {
  return {
    label: t(SELECTION_STATUS_LABEL_KEYS[status]),
    tone: SELECTION_STATUS_TONE[status],
  };
}

/**
 * Whether the owner should be offered GitHub App installation/selection
 * recovery guidance (organization/shared repository control, or a revoked
 * private-repository authorization).
 */
export function sourceNeedsRepositoryControlRecovery(
  status: Partial<
    Pick<ProjectSourceStatusDto, "authorizationStatus" | "selectionStatus">
  >,
): boolean {
  return (
    status.authorizationStatus === "authorization_required" ||
    status.authorizationStatus === "revoked" ||
    status.selectionStatus === "unselected" ||
    status.selectionStatus === "revoked"
  );
}

/** Defends the source status panel against an absent optional array/timestamp
 * even though the backend currently always returns the full status shape. */
export function getSafeUnavailableAreas(status: {
  unavailableAreas?: ProjectSourceStatusDto["unavailableAreas"] | null;
}): string[] {
  return status.unavailableAreas ?? [];
}
