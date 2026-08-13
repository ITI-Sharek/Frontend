import {
  CircleSlash,
  CloudUpload,
  FileCheck2,
  Loader2,
  ShieldAlert,
  ShieldQuestion,
  Trash2,
} from "lucide-react";
import type { TFunction } from "i18next";
import type { ComponentType } from "react";

import type { StatusChipTone } from "@/shared/components/data-display/status-chip";

import type { MaterialDto, MaterialVersionDto } from "../types/material.types";

/**
 * Every state a Material Version can be presented in.
 *
 * `UPLOADING` is the only one the client owns; the rest are read from the
 * server and never inferred from elapsed time or from the absence of a field.
 *
 * `SCAN_UNAVAILABLE` is a distinct state rather than a flavour of REJECTED on
 * purpose. Both are undownloadable, but one means the file was found to be
 * malware and the other means we never managed to check it — telling an owner
 * the first when the second is true is an accusation.
 */
export type MaterialVersionState =
  | "UPLOADING"
  | "QUARANTINED"
  | "SCAN_UNAVAILABLE"
  | "SCANNING"
  | "READY"
  | "REJECTED"
  | "PURGE_PENDING"
  | "DELETED";

export const SCAN_ABANDONED_CODE = "MATERIAL_SCAN_ABANDONED";

export interface MaterialStateMeta {
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
  label: string;
  /** Said in full next to the chip, so the state never rests on the icon. */
  description: string;
}

interface MaterialStateCopy {
  tone: StatusChipTone;
  icon: ComponentType<{ className?: string }>;
  labelKey: string;
  descriptionKey: string;
}

const STATE_META: Record<MaterialVersionState, MaterialStateCopy> = {
  UPLOADING: {
    tone: "waiting",
    icon: CloudUpload,
    labelKey: "material.state.uploading",
    descriptionKey: "material.state.uploadingDescription",
  },
  QUARANTINED: {
    tone: "waiting",
    icon: ShieldQuestion,
    labelKey: "material.state.quarantined",
    descriptionKey: "material.state.quarantinedDescription",
  },
  SCANNING: {
    tone: "waiting",
    icon: Loader2,
    labelKey: "material.state.scanning",
    descriptionKey: "material.state.scanningDescription",
  },
  SCAN_UNAVAILABLE: {
    tone: "attention",
    icon: ShieldAlert,
    labelKey: "material.state.scanUnavailable",
    descriptionKey: "material.state.scanUnavailableDescription",
  },
  READY: {
    tone: "positive",
    icon: FileCheck2,
    labelKey: "material.state.ready",
    descriptionKey: "material.state.readyDescription",
  },
  REJECTED: {
    tone: "negative",
    icon: CircleSlash,
    labelKey: "material.state.rejected",
    descriptionKey: "material.state.rejectedDescription",
  },
  PURGE_PENDING: {
    tone: "negative",
    icon: Trash2,
    labelKey: "material.state.purgePending",
    descriptionKey: "material.state.purgePendingDescription",
  },
  DELETED: {
    tone: "negative",
    icon: Trash2,
    labelKey: "material.state.deleted",
    descriptionKey: "material.state.deletedDescription",
  },
};

/**
 * Deletion outranks scan state. A deleted Material's newest version may still
 * read READY, and showing that would offer a file whose bytes are already gone.
 */
export function getMaterialVersionState(
  material: Pick<MaterialDto, "deletedAt">,
  version: Pick<MaterialVersionDto, "scanStatus" | "scanErrorCode" | "purgedAt">,
): MaterialVersionState {
  if (material.deletedAt) {
    return version.purgedAt ? "DELETED" : "PURGE_PENDING";
  }
  if (version.purgedAt) return "DELETED";
  if (version.scanStatus === "READY") return "READY";
  if (version.scanStatus === "REJECTED") return "REJECTED";
  if (version.scanStatus === "SCANNING") return "SCANNING";
  return version.scanErrorCode === SCAN_ABANDONED_CODE
    ? "SCAN_UNAVAILABLE"
    : "QUARANTINED";
}

export function getMaterialStateMeta(
  t: TFunction,
  state: MaterialVersionState,
): MaterialStateMeta {
  const copy = STATE_META[state];
  return {
    tone: copy.tone,
    icon: copy.icon,
    label: t(copy.labelKey),
    description: t(copy.descriptionKey),
  };
}

/**
 * The single gate on the download affordance.
 *
 * READY and nothing else. "Anything but rejected" would offer quarantined
 * files, and quarantined covers both a pending scan and one abandoned after
 * repeated failure — neither has ever produced a clean verdict.
 */
export function canDownloadVersion(
  material: Pick<MaterialDto, "deletedAt">,
  version: Pick<MaterialVersionDto, "scanStatus" | "scanErrorCode" | "purgedAt">,
): boolean {
  return getMaterialVersionState(material, version) === "READY";
}

/**
 * Why the download is unavailable, for the disabled control's own label. A
 * control that is merely greyed out tells a keyboard or screen-reader user
 * nothing about what would change it.
 */
export function getDownloadBlockedReason(
  t: TFunction,
  state: MaterialVersionState,
): string | null {
  if (state === "READY") return null;
  return getMaterialStateMeta(t, state).description;
}

const VISIBILITY_COPY: Record<
  MaterialDto["visibility"],
  { labelKey: string; descriptionKey: string }
> = {
  PUBLIC: {
    labelKey: "material.visibility.public",
    descriptionKey: "material.visibility.publicDescription",
  },
  RESTRICTED_PROJECT: {
    labelKey: "material.visibility.restrictedProject",
    descriptionKey: "material.visibility.restrictedProjectDescription",
  },
  ASSIGNMENT: {
    labelKey: "material.visibility.assignment",
    descriptionKey: "material.visibility.assignmentDescription",
  },
};

export function getVisibilityCopy(
  t: TFunction,
  visibility: MaterialDto["visibility"],
) {
  const copy = VISIBILITY_COPY[visibility];
  return {
    label: t(copy.labelKey),
    description: t(copy.descriptionKey),
  };
}

/** Bytes as the server states them, in units a person reads. */
export function formatBytes(t: TFunction, bytes: number): string {
  if (bytes < 1024) return `${bytes} ${t("material.bytesUnit")}`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${Math.round(kilobytes)} ${t("material.kilobytesUnit")}`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes < 10 ? 1 : 0)} ${t("material.megabytesUnit")}`;
}

const MIME_LABELS: Record<string, string | undefined> = {
  "application/pdf": "material.mime.pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "material.mime.docx",
  "text/markdown": "material.mime.markdown",
  "text/plain": "material.mime.textPlain",
};

/**
 * Labels come from the server's list, never from a hardcoded set of formats:
 * an unrecognised type is shown as itself rather than dropped, so raising the
 * allowlist server-side cannot silently hide a format from the form.
 */
export function formatMimeType(t: TFunction, mimeType: string): string {
  const key = MIME_LABELS[mimeType];
  return key === undefined ? mimeType : t(key);
}
