import type {
  ListNotificationsInput,
  NotificationFilters,
  NotificationType,
} from "../types/notification.types";

export type NormalizedNotificationFilters = NotificationFilters;

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 20;
export const LATEST_NOTIFICATION_PAGE_SIZE = 5;

export function normalizeNotificationFilters(
  input: ListNotificationsInput = {},
): NormalizedNotificationFilters {
  return {
    limit: input.limit ?? DEFAULT_NOTIFICATION_PAGE_SIZE,
    ...(input.readState === undefined ? {} : { readState: input.readState }),
    ...(input.type === undefined ? {} : { type: input.type }),
  };
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => ["notifications", "list"] as const,
  list: (filters: NormalizedNotificationFilters) =>
    ["notifications", "list", filters] as const,
  unreadCount: (type?: NotificationType) =>
    type === undefined
      ? (["notifications", "unread-count"] as const)
      : (["notifications", "unread-count", type] as const),
  preferences: () => ["notifications", "preferences"] as const,
};
