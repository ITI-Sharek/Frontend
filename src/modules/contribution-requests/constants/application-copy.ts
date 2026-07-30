import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

const ERROR_COPY: Record<string, string> = {
  APPLICATION_DECISION_FEEDBACK_REQUIRED:
    "اكتب ملاحظات واضحة تشرح قرار عدم الاختيار.",
  APPLICATION_TERMINAL:
    "تغيّرت حالة طلب التقديم ولم يعد القرار متاحًا. حدّثنا البيانات الحالية.",
  APPLICATION_CONCURRENT_MODIFICATION:
    "سبق إجراء تغيير على طلب التقديم. حدّثنا الحالة الحالية لتجنب قرار مكرر.",
  REQUEST_CANCELLED:
    "أُلغي طلب المساهمة، لذلك لم يعد من الممكن تسجيل هذا القرار.",
  REQUEST_TERMINAL:
    "انتقل طلب المساهمة إلى حالة نهائية ولا يمكن إنشاء قرار جديد.",
  APPLICATION_NOT_AUTHORIZED:
    "طلب التقديم غير متاح لهذا الحساب.",
  APPLICATION_IDEMPOTENCY_KEY_REQUIRED:
    "تعذر تأمين القرار لإعادة المحاولة. أعد فتح الإجراء وحاول مرة أخرى.",
  APPLICATION_IDEMPOTENCY_CONFLICT:
    "تعارض هذا القرار مع محاولة سابقة. راجع الحالة الحالية قبل المحاولة.",
  OWNER_DECISION_REPORT_ALREADY_EXISTS:
    "أُرسل بلاغ عن هذه الملاحظات من قبل، وهو محفوظ للمراجعة.",
};

export function getApplicationErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (code && ERROR_COPY[code]) return ERROR_COPY[code];
  if (isAxiosError(error) && error.response?.status === 401) {
    return "انتهت جلسة تسجيل الدخول. سجّل الدخول ثم حاول مرة أخرى.";
  }
  return "تعذر إكمال العملية الآن. احتفظنا بمدخلاتك؛ حاول مرة أخرى.";
}

export function shouldRefreshApplicationAfterError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "APPLICATION_TERMINAL" ||
    code === "APPLICATION_CONCURRENT_MODIFICATION" ||
    code === "REQUEST_CANCELLED" ||
    code === "REQUEST_TERMINAL"
  );
}
