import type { NotificationType } from "../types/notification.types";

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    application_status: "حالة الطلب",
    skill_review: "مراجعة المهارات",
    delivery_update: "تحديث التسليم",
    match_found: "مطابقة",
    task_recommendation: "ترشيح مهمة",
    plan_limit: "حدود الخطة",
    system: "النظام",
  };
  return labels[type];
}

export function formatNotificationDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
