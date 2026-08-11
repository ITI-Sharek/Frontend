import type {
  NotificationEventPayload,
  NotificationPresentationDto,
  NotificationPriority,
  RealtimeEventEnvelope,
} from "../types/notification.types";

const notificationPriorities: ReadonlySet<NotificationPriority> = new Set([
  "urgent",
  "attention",
  "ambient",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function isNotificationPresentationDto(
  value: unknown,
): value is NotificationPresentationDto {
  if (!isRecord(value)) return false;

  return (
    isUuid(value.notificationId) &&
    typeof value.type === "string" &&
    value.type.trim().length > 0 &&
    typeof value.templateKey === "string" &&
    Number.isInteger(value.templateVersion) &&
    Number(value.templateVersion) > 0 &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    (typeof value.deepLink === "string" || value.deepLink === null) &&
    typeof value.priority === "string" &&
    notificationPriorities.has(value.priority as NotificationPriority) &&
    typeof value.isRead === "boolean" &&
    (isIsoDate(value.readAt) || value.readAt === null) &&
    isIsoDate(value.createdAt) &&
    Number.isInteger(value.aggregateVersion) &&
    Number(value.aggregateVersion) > 0
  );
}

export function isRealtimeEventEnvelope(
  value: unknown,
): value is RealtimeEventEnvelope<NotificationEventPayload> {
  if (!isRecord(value) || value.version !== 1) return false;
  if (
    value.type !== "notification.created" &&
    value.type !== "notification.read_state_changed"
  ) {
    return false;
  }

  if (
    !isUuid(value.eventId) ||
    !isIsoDate(value.occurredAt) ||
    !isUuid(value.aggregateId) ||
    !Number.isInteger(value.aggregateVersion) ||
    Number(value.aggregateVersion) <= 0 ||
    !isRecord(value.payload) ||
    !isNotificationPresentationDto(value.payload.notification)
  ) {
    return false;
  }

  return value.payload.notification.notificationId === value.aggregateId;
}
