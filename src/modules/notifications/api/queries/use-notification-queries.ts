import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getNotificationPreferences,
  getUnreadNotificationCount,
  listNotifications,
} from "../../services/notifications.service";
import type {
  ListNotificationsInput,
  NotificationType,
} from "../../types/notification.types";
import {
  LATEST_NOTIFICATION_PAGE_SIZE,
  normalizeNotificationFilters,
  notificationKeys,
} from "../query-keys";

export function useNotificationListQuery(
  filters: ListNotificationsInput = {},
) {
  const normalizedFilters = normalizeNotificationFilters(filters);

  return useInfiniteQuery({
    queryKey: notificationKeys.list(normalizedFilters),
    queryFn: ({ pageParam }) =>
      listNotifications({ ...normalizedFilters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useLatestNotificationsQuery(
  filters: Omit<ListNotificationsInput, "limit"> = {},
) {
  const normalizedFilters = normalizeNotificationFilters({
    ...filters,
    limit: LATEST_NOTIFICATION_PAGE_SIZE,
  });

  return useQuery({
    queryKey: notificationKeys.list(normalizedFilters),
    queryFn: () => listNotifications(normalizedFilters),
  });
}

export function useUnreadNotificationCountQuery(type?: NotificationType) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(type),
    queryFn: () => getUnreadNotificationCount(type),
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: getNotificationPreferences,
  });
}
