import type { TFunction } from "i18next";

import type {
  NotificationPriority,
  NotificationPresentationDto,
  NotificationPresentationType,
  RealtimeNotificationDto,
  NotificationType,
} from "../types/notification.types";

export function getNotificationTypeLabel(
  t: TFunction,
  type: NotificationPresentationType,
): string {
  return t(`notifications.types.${type as NotificationType}`, { defaultValue: t("notifications.fallback") });
}

export function getNotificationPriorityLabel(
  t: TFunction,
  priority: NotificationPriority | string,
): string {
  return t(`notifications.priorities.${priority as NotificationPriority}`, { defaultValue: t("notifications.fallback") });
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
  t: TFunction,
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
        title: t("notifications.skillProfile.adminReadyTitle"),
        message: t("notifications.skillProfile.adminReadyMessage", { count: skillCount }),
      };
    }
    return {
      title: t("notifications.skillProfile.readyTitle"),
      message: t("notifications.skillProfile.readyMessage", { count: skillCount }),
    };
  }

  if (status === "needs_more_evidence") {
    return {
      title: t("notifications.skillProfile.moreEvidenceTitle"),
      message: t("notifications.skillProfile.moreEvidenceMessage"),
    };
  }

  if (status === "failed") {
    return {
      title: t("notifications.skillProfile.failedTitle"),
      message: t("notifications.skillProfile.failedMessage"),
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

export function formatNotificationDate(createdAt: string, locale: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
