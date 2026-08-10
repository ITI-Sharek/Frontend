export const NOTIFICATION_TYPES = [
  "application_status",
  "proposal_status",
  "assignment_status",
  "material_status",
  "skill_review",
  "skill_profile_generation",
  "delivery_update",
  "match_found",
  "task_recommendation",
  "plan_limit",
  "moderation",
  "account_security",
  "conversation_activity",
  "assignment_call",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/**
 * Retained Notifications may outlive the client release that introduced their
 * semantic category. Known categories remain strongly typed for filters and
 * preferences, while presentation accepts a future backend category and uses
 * the generic label until this client is upgraded.
 */
export type NotificationPresentationType = NotificationType | (string & {});

export type NotificationPriority = "urgent" | "attention" | "ambient";

export type NotificationRetentionDays = 30 | 90 | 180 | 365;

export interface NotificationPresentationDto {
  notificationId: string;
  type: NotificationPresentationType;
  templateKey: string;
  templateVersion: number;
  title: string;
  body: string;
  deepLink: string | null;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  aggregateVersion: number;
}

export interface NotificationPageDto {
  items: NotificationPresentationDto[];
  nextCursor: string | null;
}

export interface NotificationFilters {
  readState?: "read" | "unread";
  type?: NotificationType;
  limit: number;
}

export interface ListNotificationsInput {
  cursor?: string;
  limit?: number;
  readState?: "read" | "unread";
  type?: NotificationType;
}

export interface NotificationUnreadCountDto {
  unreadCount: number;
}

export interface NotificationReadStateResponseDto
  extends NotificationPresentationDto {}

export interface MarkAllNotificationsReadResponseDto {
  updatedCount: number;
  snapshotAt: string;
}

export interface NotificationQuietHoursDto {
  enabled: boolean;
  startLocal: string | null;
  endLocal: string | null;
  timeZone: string | null;
}

export interface NotificationCategoryPreferenceDto {
  type: NotificationType;
  requiredInApp: boolean;
  inAppEnabled: boolean;
  browserEnabled: boolean;
}

export interface NotificationPreferencesDto {
  retentionDays: NotificationRetentionDays;
  quietHours: NotificationQuietHoursDto;
  revision: number;
  categories: NotificationCategoryPreferenceDto[];
}

export interface NotificationCategoryPreferencePatch {
  type: NotificationType;
  inAppEnabled: boolean;
  browserEnabled?: boolean;
}

export interface NotificationQuietHoursPatch {
  enabled: boolean;
  startLocal?: string | null;
  endLocal?: string | null;
  timeZone?: string | null;
}

export interface UpdateNotificationPreferencesDto {
  expectedRevision: number;
  retentionDays?: NotificationRetentionDays;
  quietHours?: NotificationQuietHoursPatch;
  categories?: NotificationCategoryPreferencePatch[];
}

export type RealtimeEventType =
  | "notification.created"
  | "notification.read_state_changed";

export interface RealtimeEventEnvelope<TPayload> {
  eventId: string;
  type: RealtimeEventType;
  version: 1;
  occurredAt: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: TPayload;
}

export interface NotificationEventPayload {
  notification: NotificationPresentationDto;
}

export type NotificationConnectionStatus =
  | "idle"
  | "connecting"
  | "synchronizing"
  | "connected"
  | "delayed"
  | "unauthorized";
