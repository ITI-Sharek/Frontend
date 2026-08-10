import type {
  NotificationPriority,
  NotificationPresentationType,
  NotificationType,
} from "../types/notification.types";

const typeLabels: Record<NotificationType, string> = {
  application_status: "حالة الطلب",
  proposal_status: "حالة المقترح",
  assignment_status: "حالة الإسناد",
  material_status: "حالة المادة",
  skill_review: "مراجعة المهارات",
  skill_profile_generation: "تحليل المهارات",
  delivery_update: "تحديث التسليم",
  match_found: "مطابقة",
  task_recommendation: "ترشيح مهمة",
  plan_limit: "حدود الخطة",
  moderation: "إشعار إشراف",
  account_security: "أمان الحساب",
  conversation_activity: "نشاط المحادثة",
  assignment_call: "مكالمة الإسناد",
  system: "النظام",
};

const priorityLabels: Partial<Record<NotificationPriority, string>> = {
  urgent: "عاجل",
  attention: "يحتاج انتباهًا",
  ambient: "للعلم",
};

export function getNotificationTypeLabel(
  type: NotificationPresentationType,
): string {
  if (type in typeLabels) return typeLabels[type as NotificationType];
  return "إشعار";
}

export function getNotificationPriorityLabel(
  priority: NotificationPriority | string,
): string {
  return priorityLabels[priority as NotificationPriority] ?? "إشعار";
}

export function formatNotificationDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
