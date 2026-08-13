import type {
  NotificationPriority,
  NotificationPresentationDto,
  NotificationPresentationType,
  RealtimeNotificationDto,
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

export interface NotificationContent {
  title: string;
  message: string;
}

/**
 * Notification rows are persisted with provider-neutral copy. Present the
 * copy in the app's Arabic UI without mutating the durable row or losing the
 * original metadata used by other clients.
 */
export function getNotificationContent(
  notification: NotificationPresentationDto | RealtimeNotificationDto,
): NotificationContent {
  const fallbackMessage =
    "body" in notification
      ? (notification.message ?? notification.body)
      : notification.message;

  if (notification.type !== "skill_profile_generation") {
    return {
      title: notification.title,
      message: fallbackMessage,
    };
  }

  const metadata = asRecord(notification.metadata);
  const status = metadata.status;

  if (status === "ready_for_review") {
    const skillCount = toNonNegativeInteger(metadata.skillCount);
    if (metadata.audience === "admin") {
      return {
        title: "تحليل مهارات جديد للمراجعة",
        message: `يوجد تحليل مهارات مكتمل من أحد المساهمين ويحتوي على ${skillCount} ${skillCount === 1 ? "مهارة" : "مهارات"} في انتظار مراجعتك.`,
      };
    }
    return {
      title: "تحليل المهارات جاهز للمراجعة",
      message: `اكتمل تحليل مهاراتك. توجد ${skillCount} ${skillCount === 1 ? "مهارة" : "مهارات"} في انتظار مراجعة الإدارة.`,
    };
  }

  if (status === "needs_more_evidence") {
    return {
      title: "نحتاج إلى أدلة إضافية",
      message:
        "اكتمل تحليل المهارات، لكن الأدلة المتاحة غير كافية. اختر مستودعات إضافية أو أعد المحاولة.",
    };
  }

  if (status === "failed") {
    return {
      title: "تعذر إكمال تحليل المهارات",
      message: "حدثت مشكلة أثناء التحليل. أعد المحاولة من صفحة تحليل المهارات.",
    };
  }

  return {
    title: notification.title,
    message: fallbackMessage,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function toNonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : 0;
}

export function formatNotificationDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
