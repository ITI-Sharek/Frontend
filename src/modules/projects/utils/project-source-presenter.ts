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

const SYNC_STATUS_META: Record<ProjectSourceSyncStatus, SourceStatusMeta> = {
  fresh: { label: "محدَّث", tone: "positive" },
  stale: { label: "قديم — يحتاج تحديثاً", tone: "attention" },
  refreshing: { label: "جارٍ التحديث", tone: "waiting" },
  partial: { label: "تحديث جزئي", tone: "attention" },
  failed: { label: "فشل آخر تحديث", tone: "negative" },
  authorization_revoked: { label: "أُلغي التفويض", tone: "negative" },
};

const AUTHORIZATION_STATUS_META: Record<
  ProjectSourceAuthorizationStatus,
  SourceStatusMeta
> = {
  public_read: { label: "قراءة عامة", tone: "neutral" },
  authorized: { label: "مُفوَّض", tone: "positive" },
  authorization_required: { label: "يتطلب تفويضاً", tone: "attention" },
  revoked: { label: "أُلغي التفويض", tone: "negative" },
  unknown: { label: "غير معروف", tone: "neutral" },
};

const SELECTION_STATUS_META: Record<
  ProjectSourceSelectionStatus,
  SourceStatusMeta
> = {
  not_required: { label: "غير مطلوب", tone: "neutral" },
  selected: { label: "مُحدَّد", tone: "positive" },
  unselected: { label: "غير محدَّد", tone: "attention" },
  revoked: { label: "أُلغي", tone: "negative" },
  unknown: { label: "غير معروف", tone: "neutral" },
};

const OWNER_TYPE_LABELS: Record<ProjectRepositoryOwnerType, string> = {
  organization: "منظمة",
  user: "حساب شخصي",
  unknown: "نوع الحساب غير معروف",
};

export function getOwnerTypeLabel(ownerType: ProjectRepositoryOwnerType): string {
  return OWNER_TYPE_LABELS[ownerType];
}

export function getSourceSyncStatusMeta(
  status: ProjectSourceSyncStatus,
): SourceStatusMeta {
  return SYNC_STATUS_META[status];
}

export function getSourceAuthorizationStatusMeta(
  status: ProjectSourceAuthorizationStatus,
): SourceStatusMeta {
  return AUTHORIZATION_STATUS_META[status];
}

export function getSourceSelectionStatusMeta(
  status: ProjectSourceSelectionStatus,
): SourceStatusMeta {
  return SELECTION_STATUS_META[status];
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
