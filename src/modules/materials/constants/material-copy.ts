import { isAxiosError } from "axios";

import {
  getApiErrorCode,
  getApiErrorMetadataNumber,
} from "@/shared/utils/get-api-error-code";

import { formatBytes } from "../utils/material-state";

/**
 * Stable `code` values are the contract; `message` is human copy and is never
 * branched on.
 */
const ERROR_COPY: Record<string, string> = {
  MATERIAL_FILE_REQUIRED: "اختر ملفًا قبل الرفع.",
  MATERIAL_TYPE_UNSUPPORTED:
    "صيغة الملف غير مدعومة. اختر ملفًا بإحدى الصيغ المذكورة أعلاه.",
  MATERIAL_CONTENT_MISMATCH:
    "محتوى الملف لا يطابق صيغته المعلنة. تأكد من أن الملف سليم وغير معاد تسميته.",
  MATERIAL_VISIBILITY_SCOPE_MISMATCH:
    "خيار «خاص بالإسناد» متاح لمواد طلب المساهمة فقط، لأن المشروع نفسه لا يحمل إسنادًا.",
  MATERIAL_NOT_AUTHORIZED: "هذا الإجراء غير متاح لهذا الحساب.",
  MATERIAL_NOT_FOUND: "المادة غير متاحة. ربما حُذفت أو لم تعد تملك صلاحية عليها.",
  MATERIAL_VERSION_NOT_FOUND: "هذه النسخة لم تعد متاحة.",
  MATERIAL_VERSION_NOT_DOWNLOADABLE:
    "هذه النسخة غير متاحة للتنزيل لأنها لم تجتز الفحص الأمني.",
  MATERIAL_GRANT_NOT_APPLICABLE:
    "الصلاحيات الصريحة تخص المواد المقيّدة بالمشروع فقط. غيّر مستوى الظهور أولًا.",
  MATERIAL_GRANT_NOT_ASSIGNEE:
    "لا يمكن منح الصلاحية إلا لمساهم لديه إسناد قائم في هذا المشروع.",
  MATERIAL_GRANT_ALREADY_LIVE: "هذا المساهم يملك صلاحية سارية بالفعل.",
  MATERIAL_GRANT_SELF: "أنت مالك المادة ولديك صلاحية الوصول إليها أصلًا.",
  MATERIAL_GRANT_NOT_FOUND: "لا توجد صلاحية سارية لسحبها لهذا المساهم.",
  MATERIAL_VISIBILITY_UNCHANGED: "المادة تحمل مستوى الظهور هذا بالفعل.",
  MATERIAL_VISIBILITY_CONFLICT:
    "تغيّر مستوى الظهور أثناء تنفيذ الطلب. حدّث الصفحة وأعد المحاولة.",
  MATERIAL_ALREADY_DELETED: "سبق حذف هذه المادة.",
  MATERIAL_DOWNLOAD_TOKEN_EXPIRED:
    "انتهت صلاحية رابط التنزيل. أعد المحاولة للحصول على رابط جديد.",
  MATERIAL_DOWNLOAD_TOKEN_INVALID: "رابط التنزيل غير صالح. أعد المحاولة.",
  MATERIAL_DOWNLOAD_TOKEN_SUBJECT_MISMATCH:
    "رابط التنزيل صادر لحساب آخر ولا يمكن استخدامه من هذا الحساب.",
  MATERIAL_IDEMPOTENCY_KEY_REQUIRED:
    "تعذّر تأمين الطلب لإعادة المحاولة. أعد فتح الإجراء وحاول مرة أخرى.",
  MATERIAL_IDEMPOTENCY_CONFLICT:
    "تعارض هذا الطلب مع محاولة سابقة. حدّث الصفحة قبل إعادة المحاولة.",
};

const NETWORK_ERROR =
  "تعذّر الاتصال بالخادم. تحقق من الاتصال ثم أعد المحاولة.";
const UNKNOWN_ERROR = "تعذّر إتمام العملية. أعد المحاولة.";

export function getMaterialErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);

  // The limit is quoted from the rejection itself rather than from the
  // constraints query: if the two ever disagree, the number that actually
  // refused this file is the honest one to show.
  if (code === "MATERIAL_TOO_LARGE") {
    const maxBytes = getApiErrorMetadataNumber(error, "maxBytes");
    return maxBytes === null
      ? "حجم الملف يتجاوز الحد المسموح به."
      : `حجم الملف يتجاوز الحد المسموح به (${formatBytes(maxBytes)}).`;
  }

  if (code && code in ERROR_COPY) return ERROR_COPY[code];
  if (isAxiosError(error) && error.response === undefined) return NETWORK_ERROR;
  return UNKNOWN_ERROR;
}

export const MATERIAL_COPY = {
  sectionTitle: "المواد والمستندات",
  sectionDescription:
    "ارفع مستندات المشروع وشاركها مع من تختاره. رفع الملف هنا لا يعني الموافقة على معالجته بالذكاء الاصطناعي.",
  uploadTitle: "رفع مادة جديدة",
  emptyOwner: "لم ترفع أي مادة بعد.",
  emptyReader: "لا توجد مواد متاحة لك في هذا المشروع.",
  loading: "جارٍ تحميل المواد…",
  loadFailed: "تعذّر تحميل المواد. حدّث الصفحة وأعد المحاولة.",
} as const;
