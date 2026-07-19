export type NotificationType =
  | "application_status"
  | "skill_review"
  | "delivery_update"
  | "match_found"
  | "task_recommendation"
  | "plan_limit"
  | "system";

export interface RealtimeNotificationDto {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: unknown;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export type NotificationConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "unauthorized";
