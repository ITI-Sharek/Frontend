import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

/**
 * Safe Arabic copy for the SK-112 error matrix
 * (`server/specs/003-github-project-publication/contracts/http-api.md`
 * §Error Matrix). Never branches on raw `message` text.
 */
const PROJECT_ERROR_MESSAGES: Record<string, string> = {
  GITHUB_REPOSITORY_REFERENCE_INVALID:
    "رابط أو اسم المستودع غير صالح — تأكد من الصيغة (owner/name أو رابط GitHub كامل).",
  PROJECT_REQUEST_INVALID: "بيانات الطلب غير صالحة — راجع الحقول وحاول مرة أخرى.",
  PROJECT_ACCOUNT_NOT_ELIGIBLE: "حسابك غير مؤهل لهذا الإجراء حالياً.",
  GITHUB_SOURCE_NOT_AVAILABLE:
    "تعذّر الوصول إلى هذا المستودع بأمان — تأكد من الرابط أو صلاحياتك.",
  PROJECT_NOT_FOUND: "لم نعثر على هذا المشروع.",
  PROJECT_REVISION_CONFLICT:
    "تغيّر المشروع في مكان آخر — أعدنا تحميل أحدث نسخة، راجعها وحاول مرة أخرى.",
  PROJECT_IDEMPOTENCY_KEY_REUSED:
    "تعذّر تكرار هذا الإجراء بنفس الطلب — ابدأ إجراءً جديداً.",
  PROJECT_SOURCE_CHANGED_SINCE_PREVIEW:
    "تغيّرت بيانات المستودع منذ آخر معاينة — عايِن المستودع مرة أخرى.",
  PROJECT_REPOSITORY_ALREADY_PUBLISHED:
    "هذا المستودع منشور بالفعل ضمن مشروع آخر.",
  PROJECT_STATE_TRANSITION_INVALID:
    "لا يمكن تنفيذ هذا الانتقال لحالة المشروع الحالية.",
  PROJECT_IMPORT_ROUTE_RETIRED:
    "طريقة الاستيراد القديمة لم تعد متاحة — استخدم المعاينة ثم الحفظ كمسودة.",
  PROJECT_PUBLICATION_INCOMPLETE:
    "أكمل الحقول المطلوبة (العنوان والتصنيف ومستوى الصعوبة) قبل النشر.",
  PROJECT_REPOSITORY_CONTROL_REQUIRED:
    "يلزم إثبات التحكم بالمستودع قبل النشر — تحقق من هوية GitHub الشخصية أو اختيار المستودع عبر تطبيق GitHub.",
  PROJECT_SOURCE_AUTHORIZATION_REQUIRED:
    "تعذّر الوصول إلى المستودع — أعد ربط تطبيق GitHub أو تحقق من اختيار المستودع.",
  GITHUB_RATE_LIMITED: "تجاوزنا حد الطلبات مع GitHub — حاول مرة أخرى بعد قليل.",
  PROJECT_PUBLICATION_RECONCILIATION_REQUIRED:
    "يحتاج هذا المستودع مراجعة تقنية قبل النشر — حاول مرة أخرى لاحقاً.",
  GITHUB_PROVIDER_UNAVAILABLE:
    "خدمة GitHub غير متاحة حالياً — حاول مرة أخرى بعد قليل.",
  GITHUB_PROVIDER_INVALID_RESPONSE: "وصل رد غير متوقع من GitHub — حاول مرة أخرى.",
  GITHUB_PROVIDER_TIMEOUT: "استغرق GitHub وقتاً أطول من المتوقع — حاول مرة أخرى.",
};

const FALLBACK_MESSAGE = "حدث خطأ غير متوقع — حاول مرة أخرى.";

export function getProjectApiErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (code && code in PROJECT_ERROR_MESSAGES) {
    return PROJECT_ERROR_MESSAGES[code];
  }
  return getApiErrorMessage(error, FALLBACK_MESSAGE);
}

export function isRepositoryControlRecoveryError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "PROJECT_REPOSITORY_CONTROL_REQUIRED" ||
    code === "PROJECT_SOURCE_AUTHORIZATION_REQUIRED"
  );
}

export function isRevisionConflictError(error: unknown): boolean {
  return getApiErrorCode(error) === "PROJECT_REVISION_CONFLICT";
}

export function isPreviewStaleError(error: unknown): boolean {
  return getApiErrorCode(error) === "PROJECT_SOURCE_CHANGED_SINCE_PREVIEW";
}
