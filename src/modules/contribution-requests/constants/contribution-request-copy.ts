import { isAxiosError } from "axios";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

import type { ContributionRequestLocale } from "../types/contribution-request.types";

const ERROR_COPY: Record<ContributionRequestLocale, Record<string, string>> = {
  ar: {
    CONTRIBUTION_REQUEST_OWNER_ACCESS_REQUIRED:
      "هذه الصفحة متاحة فقط لحساب صاحب مشروع نشط.",
    CONTRIBUTION_REQUEST_PROJECT_NOT_FOUND:
      "لم نعثر على المشروع، أو أنه غير متاح لهذا الحساب.",
    CONTRIBUTION_REQUEST_PROJECT_NOT_PUBLISHED:
      "انشر المشروع أولًا قبل إنشاء طلب مساهمة.",
    CONTRIBUTION_REQUEST_NOT_FOUND:
      "لم نعثر على طلب المساهمة، أو أنه غير متاح لهذا الحساب.",
    CONTRIBUTION_REQUEST_UPDATE_EMPTY: "لم تُجرَ أي تغييرات قابلة للحفظ.",
    CONTRIBUTION_REQUEST_DRAFT_NOT_EDITABLE:
      "لم يعد طلب المساهمة مسودة قابلة للتعديل.",
    CONTRIBUTION_REQUEST_REQUIRED_REQUIREMENT_MISSING:
      "أضف متطلبًا مطلوبًا واحدًا على الأقل.",
    CONTRIBUTION_REQUEST_REQUIREMENT_DUPLICATE:
      "لا يمكن تكرار المتطلب أو وضعه كمطلوب ومفضل معًا.",
    CONTRIBUTION_REQUEST_CLOSE_TIME_REQUIRED: "حدد وقت إغلاق التقديم.",
    CONTRIBUTION_REQUEST_CLOSE_TIME_INVALID:
      "يجب أن يكون وقت إغلاق التقديم في المستقبل.",
    CONTRIBUTION_REQUEST_DATE_ORDER_INVALID:
      "يجب أن يكون تاريخ الإنجاز المستهدف بعد وقت إغلاق التقديم.",
    CONTRIBUTION_REQUEST_REWARD_INVALID:
      "تحقق من قيمة المكافأة ورمز العملة.",
    CONTRIBUTION_REQUEST_CONCURRENT_MODIFICATION:
      "تغيرت المسودة أثناء التعديل. حمّلنا أحدث نسخة؛ راجعها ثم حاول مجددًا.",
    CONTRIBUTION_REQUEST_IDEMPOTENCY_KEY_INVALID:
      "تعذر تأمين إعادة المحاولة. غيّر البيانات وحاول مرة أخرى.",
    CONTRIBUTION_REQUEST_IDEMPOTENCY_CONFLICT:
      "تعارضت محاولة سابقة مع هذه البيانات. راجع الحقول ثم أعد الإرسال.",
    CONTRIBUTION_REQUEST_DRAFT_NOT_PUBLISHABLE:
      "أكمل عقد العمل (العنوان والوصف ومتطلب مطلوب واحد على الأقل ووقت إغلاق تقديم مستقبلي) قبل النشر.",
    CONTRIBUTION_REQUEST_LIMIT_REACHED:
      "بلغت الحد الشهري لنشر طلبات المساهمة الخاص بباقتك.",
    CONTRIBUTION_REQUEST_NOT_CANCELLABLE:
      "لا يمكن إلغاء هذا الطلب في حالته الحالية.",
  },
  en: {
    CONTRIBUTION_REQUEST_OWNER_ACCESS_REQUIRED:
      "This page is available only to an active Project owner.",
    CONTRIBUTION_REQUEST_PROJECT_NOT_FOUND:
      "The Project was not found or is unavailable to this account.",
    CONTRIBUTION_REQUEST_PROJECT_NOT_PUBLISHED:
      "Publish the Project before creating a Contribution Request.",
    CONTRIBUTION_REQUEST_NOT_FOUND:
      "The Contribution Request was not found or is unavailable to this account.",
    CONTRIBUTION_REQUEST_UPDATE_EMPTY: "There are no changes to save.",
    CONTRIBUTION_REQUEST_DRAFT_NOT_EDITABLE:
      "This Contribution Request is no longer an editable draft.",
    CONTRIBUTION_REQUEST_REQUIRED_REQUIREMENT_MISSING:
      "Add at least one Required Requirement.",
    CONTRIBUTION_REQUEST_REQUIREMENT_DUPLICATE:
      "A Requirement cannot be duplicated or be both Required and Preferred.",
    CONTRIBUTION_REQUEST_CLOSE_TIME_REQUIRED: "Choose an Applications Close Time.",
    CONTRIBUTION_REQUEST_CLOSE_TIME_INVALID:
      "Applications Close Time must be in the future.",
    CONTRIBUTION_REQUEST_DATE_ORDER_INVALID:
      "Target Completion Date must be after Applications Close Time.",
    CONTRIBUTION_REQUEST_REWARD_INVALID:
      "Check the reward amount and currency code.",
    CONTRIBUTION_REQUEST_CONCURRENT_MODIFICATION:
      "The draft changed while you were editing. The latest version was loaded; review it and try again.",
    CONTRIBUTION_REQUEST_IDEMPOTENCY_KEY_INVALID:
      "The retry could not be secured. Change the command and try again.",
    CONTRIBUTION_REQUEST_IDEMPOTENCY_CONFLICT:
      "A previous attempt conflicts with this command. Review the fields and submit again.",
    CONTRIBUTION_REQUEST_DRAFT_NOT_PUBLISHABLE:
      "Complete the work contract (title, description, at least one Required Requirement, and a future Applications Close Time) before publishing.",
    CONTRIBUTION_REQUEST_LIMIT_REACHED:
      "You reached your plan's monthly Contribution Request publication limit.",
    CONTRIBUTION_REQUEST_NOT_CANCELLABLE:
      "This Contribution Request cannot be cancelled in its current state.",
  },
};

export function getContributionRequestErrorMessage(
  error: unknown,
  locale: ContributionRequestLocale = "ar",
): string {
  const code = getApiErrorCode(error);
  if (code && ERROR_COPY[locale][code]) return ERROR_COPY[locale][code];

  if (isAxiosError(error) && error.response?.status === 401) {
    return locale === "ar"
      ? "انتهت جلسة تسجيل الدخول. سجّل الدخول ثم حاول مرة أخرى."
      : "Your session expired. Sign in and try again.";
  }

  return locale === "ar"
    ? "تعذر إكمال العملية الآن. حاول مرة أخرى."
    : "The operation could not be completed. Try again.";
}

export function isContributionRequestError(
  error: unknown,
  code: string,
): boolean {
  return getApiErrorCode(error) === code;
}
