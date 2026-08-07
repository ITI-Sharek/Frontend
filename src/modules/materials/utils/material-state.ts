import {
  CircleSlash,
  CloudUpload,
  FileCheck2,
  Loader2,
  ShieldAlert,
  ShieldQuestion,
  Trash2,
} from "lucide-react";
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

const STATE_META: Record<MaterialVersionState, MaterialStateMeta> = {
  UPLOADING: {
    tone: "waiting",
    icon: CloudUpload,
    label: "جارٍ الرفع",
    description: "يجري رفع الملف إلى الخادم. لا تغلق الصفحة قبل اكتماله.",
  },
  QUARANTINED: {
    tone: "waiting",
    icon: ShieldQuestion,
    label: "في الحجر",
    description:
      "الملف محفوظ وبانتظار الفحص الأمني. لا يمكن تنزيله قبل اجتياز الفحص.",
  },
  SCANNING: {
    tone: "waiting",
    icon: Loader2,
    label: "قيد الفحص",
    description: "يجري فحص الملف الآن. سيصبح متاحًا للتنزيل بعد اجتياز الفحص.",
  },
  SCAN_UNAVAILABLE: {
    tone: "attention",
    icon: ShieldAlert,
    label: "تعذّر الفحص",
    description:
      "تعذّر إتمام الفحص الأمني بعد عدة محاولات، ولذلك يبقى الملف غير قابل للتنزيل. هذا لا يعني أن الملف ضار. ارفع نسخة جديدة أو تواصل مع الدعم.",
  },
  READY: {
    tone: "positive",
    icon: FileCheck2,
    label: "جاهز",
    description: "اجتاز الملف الفحص الأمني وأصبح متاحًا لمن يملك صلاحية الوصول.",
  },
  REJECTED: {
    tone: "negative",
    icon: CircleSlash,
    label: "مرفوض",
    description:
      "رصد الفحص الأمني محتوى ضارًا في هذه النسخة، ولن تكون متاحة للتنزيل إطلاقًا.",
  },
  PURGE_PENDING: {
    tone: "negative",
    icon: Trash2,
    label: "قيد الحذف",
    description:
      "أُلغي وصول الجميع إلى هذه المادة فورًا، ويجري الآن حذف محتواها نهائيًا.",
  },
  DELETED: {
    tone: "negative",
    icon: Trash2,
    label: "محذوف",
    description:
      "حُذف محتوى هذه المادة نهائيًا. يبقى سجل العمليات محفوظًا للمراجعة دون المحتوى.",
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
  state: MaterialVersionState,
): MaterialStateMeta {
  return STATE_META[state];
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
  state: MaterialVersionState,
): string | null {
  if (state === "READY") return null;
  return getMaterialStateMeta(state).description;
}

const VISIBILITY_COPY: Record<
  MaterialDto["visibility"],
  { label: string; description: string }
> = {
  PUBLIC: {
    label: "عام داخل المشروع",
    description:
      "متاح لأي مستخدم يستطيع رؤية المشروع المنشور. ليس متاحًا خارج المنصة.",
  },
  RESTRICTED_PROJECT: {
    label: "مقيّد بالمشروع",
    description:
      "متاح فقط لمن تمنحه صلاحية صريحة، وبشرط أن يكون مسندًا إليه عمل قائم في المشروع. ينتهي الوصول فور سحب الصلاحية أو انتهاء الإسناد.",
  },
  ASSIGNMENT: {
    label: "خاص بالإسناد",
    description:
      "متاح لك وحدك قبل وجود إسناد، ثم لك وللمساهم المسنَد إليه الطلب. ينتهي وصوله عند انتهاء الإسناد.",
  },
};

export function getVisibilityCopy(visibility: MaterialDto["visibility"]) {
  return VISIBILITY_COPY[visibility];
}

/** Bytes as the server states them, in units a person reads. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${Math.round(kilobytes)} كيلوبايت`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes < 10 ? 1 : 0)} ميجابايت`;
}

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "text/markdown": "Markdown",
  "text/plain": "نص",
};

/**
 * Labels come from the server's list, never from a hardcoded set of formats:
 * an unrecognised type is shown as itself rather than dropped, so raising the
 * allowlist server-side cannot silently hide a format from the form.
 */
export function formatMimeType(mimeType: string): string {
  return MIME_LABELS[mimeType] ?? mimeType;
}
