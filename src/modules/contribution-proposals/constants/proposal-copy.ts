import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

const ERROR_COPY: Record<string, string> = {
  PROPOSAL_PROJECT_NOT_PUBLISHED:
    "هذا المشروع لم يعد منشورًا ولا يقبل مقترحات مساهمة.",
  PROPOSAL_OWNER_CANNOT_PROPOSE:
    "صاحب المشروع لا يرسل مقترحًا إلى مشروعه؛ استخدم إنشاء طلب مساهمة.",
  PROPOSAL_INTAKE_DISABLED:
    "أوقف صاحب المشروع استقبال مقترحات المساهمة حاليًا.",
  PROPOSAL_RATE_LIMITED:
    "وصلت إلى الحد اليومي لمقترحات المساهمة. حاول في يوم آخر.",
  PROPOSAL_CURSOR_INVALID: "تعذر تحميل الصفحة التالية من المقترحات.",
  PROPOSAL_IDEMPOTENCY_CONFLICT:
    "تعارضت هذه المحاولة مع أمر سابق. راجع المقترح قبل إعادة المحاولة.",
  PROPOSAL_TERMINAL:
    "انتقل المقترح إلى حالة نهائية ولم يعد هذا الإجراء متاحًا.",
  PROPOSAL_NOT_AUTHORIZED: "هذا المقترح غير متاح لهذا الحساب.",
  PROPOSAL_IDEMPOTENCY_KEY_INVALID:
    "تعذر تأمين العملية لإعادة المحاولة. أعد فتح الإجراء.",
  PROPOSAL_CONCURRENT_MODIFICATION:
    "تغيّر المقترح في نفس الوقت. حدّث البيانات قبل تسجيل إجراء آخر.",
  PROPOSAL_NOT_FOUND: "لم نعثر على هذا المقترح أو لا تملك صلاحية عرضه.",
  PROPOSAL_NO_REVISION_REQUESTED:
    "لا يوجد طلب مراجعة مفتوح يسمح بإرسال نسخة جديدة.",
};

export function getProposalErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (code && ERROR_COPY[code]) return ERROR_COPY[code];
  if (isAxiosError(error) && error.response?.status === 401) {
    return "انتهت جلسة تسجيل الدخول. سجّل الدخول ثم حاول مرة أخرى.";
  }
  return "تعذر إكمال العملية الآن. احتفظنا بمدخلاتك؛ حاول مرة أخرى.";
}

export function shouldRefreshProposalAfterError(error: unknown): boolean {
  const code = getApiErrorCode(error);
  return (
    code === "PROPOSAL_TERMINAL" ||
    code === "PROPOSAL_CONCURRENT_MODIFICATION" ||
    code === "PROPOSAL_IDEMPOTENCY_CONFLICT"
  );
}
