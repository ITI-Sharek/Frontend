import type { DeliveryLifecycleStatus } from "../types/delivery.types";

export const DELIVERY_LIFECYCLE_COPY: Record<DeliveryLifecycleStatus, string> = {
  PENDING_OWNER_REVIEW: "طلب التقديم بانتظار قرار صاحب المشروع",
  DECLINED_BY_OWNER: "لم يتم اختيار طلب التقديم",
  NOT_SELECTED: "تم اختيار مساهم آخر",
  EXPIRED: "انتهت مهلة طلب التقديم",
  WITHDRAWN: "تم سحب طلب التقديم",
  REQUEST_CANCELLED: "أُلغي طلب المساهمة",
  AWAITING_DELIVERY: "بانتظار تسليم العمل",
  DELIVERY_SUBMITTED: "التسليم بانتظار المراجعة",
  CHANGES_REQUESTED: "طُلبت تغييرات على التسليم",
  DELIVERY_REJECTED: "رُفض التسليم",
  COMPLETED: "اكتملت المساهمة",
};

export function formatDeliveryDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
