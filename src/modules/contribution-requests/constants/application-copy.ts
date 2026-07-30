import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

import type {
  ApplicationApiErrorCode,
  ApplicationStatus,
} from "../types/application.types";

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

export type ApplicationSubmissionRecovery =
  | "existing_application"
  | "available_requests"
  | "account"
  | "edit";

type ApplicationSubmissionErrorCode = Extract<
  ApplicationApiErrorCode,
  | "ALREADY_APPLIED"
  | "APPLICATIONS_CLOSED"
  | "REQUEST_CANCELLED"
  | "REQUEST_TERMINAL"
  | "APPLICATION_NOT_AUTHORIZED"
  | "APPLICATION_IDEMPOTENCY_CONFLICT"
>;

export const APPLICATION_SUBMISSION_ERROR_META: Record<
  ApplicationSubmissionErrorCode,
  { message: string; recovery: ApplicationSubmissionRecovery }
> = {
  ALREADY_APPLIED: {
    message:
      "لديك طلب تقديم سابق لهذا الطلب. افتح حالة الطلب السابق بدلًا من إرسال نسخة أخرى.",
    recovery: "existing_application",
  },
  APPLICATIONS_CLOSED: {
    message: "أُغلق التقديم على طلب المساهمة ولم يعد يقبل طلبات جديدة.",
    recovery: "available_requests",
  },
  REQUEST_CANCELLED: {
    message: "ألغى صاحب المشروع طلب المساهمة، لذلك لم يعد التقديم متاحًا.",
    recovery: "available_requests",
  },
  REQUEST_TERMINAL: {
    message: "انتقل طلب المساهمة إلى حالة نهائية ولم يعد يقبل طلبات تقديم.",
    recovery: "available_requests",
  },
  APPLICATION_NOT_AUTHORIZED: {
    message: "هذا الحساب غير مخوّل لإرسال طلب تقديم إلى طلب المساهمة.",
    recovery: "account",
  },
  APPLICATION_IDEMPOTENCY_CONFLICT: {
    message:
      "تعارضت محاولة سابقة مع هذه البيانات. عدّل نهج المساهمة أو مدة التسليم ثم أعد الإرسال.",
    recovery: "edit",
  },
};

export const APPLICATION_STATUS_COPY: Record<
  ApplicationStatus,
  { label: string; description: string }
> = {
  PENDING_OWNER_REVIEW: {
    label: "بانتظار مراجعة صاحب المشروع",
    description:
      "أُرسل طلب التقديم مباشرة إلى صاحب المشروع. يمكنك سحبه قبل صدور قرار المالك.",
  },
  ACCEPTED: {
    label: "تم قبول طلب التقديم",
    description:
      "اختارك صاحب المشروع لهذا الطلب. راجع تفاصيل الإسناد وموعد التسليم المتفق عليه.",
  },
  DECLINED_BY_OWNER: {
    label: "اعتذر صاحب المشروع عن قبول الطلب",
    description:
      "هذا قرار بشري خاص بهذا الطلب، ولا يؤثر في ملفك أو أهليتك أو سمعتك أو طلباتك الأخرى.",
  },
  NOT_SELECTED: {
    label: "تم اختيار مساهم آخر",
    description:
      "أُغلق هذا الطلب بعد اختيار مساهم آخر. لا يؤثر ذلك في ملفك أو أهليتك أو سمعتك.",
  },
  EXPIRED: {
    label: "انتهت مهلة المراجعة",
    description:
      "انتهت مهلة مراجعة صاحب المشروع دون قرار. لا يُعد ذلك رفضًا ولا يؤثر في سمعتك.",
  },
  WITHDRAWN: {
    label: "سحبت طلب التقديم",
    description:
      "انتهى طلب التقديم بناءً على اختيارك، ولا يمكن لصاحب المشروع اتخاذ قرار عليه الآن.",
  },
  REQUEST_CANCELLED: {
    label: "أُلغي طلب المساهمة",
    description:
      "أنهى صاحب المشروع طلب المساهمة. لا يحمل هذا الإغلاق حكمًا عليك ولا يؤثر في ملفك أو سمعتك.",
  },
};

export function getApplicationSubmissionErrorMessage(error: unknown): string {
  const code = getApiErrorCode(error);
  if (isApplicationApiErrorCode(code)) {
    return APPLICATION_SUBMISSION_ERROR_META[code].message;
  }
  if (isAxiosError(error) && error.response?.status === 401) {
    return "انتهت جلسة تسجيل الدخول. سجّل الدخول ثم حاول مرة أخرى.";
  }
  return "تعذر إرسال طلب التقديم الآن. احتفظنا بمدخلاتك؛ حاول مرة أخرى.";
}

export function isApplicationApiErrorCode(
  code: string | null,
): code is ApplicationSubmissionErrorCode {
  return (
    code !== null &&
    Object.hasOwn(APPLICATION_SUBMISSION_ERROR_META, code)
  );
}
