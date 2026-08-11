import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

import type {
  NotificationPageDto,
  NotificationPresentationDto,
} from "../types/notification.types";
import type { RecentEventIds } from "@/lib/socket/recent-event-ids";
import { notificationKeys, normalizeNotificationFilters } from "../api/query-keys";
import { getNotificationPreferences } from "../services/notifications.service";
import { isRealtimeEventEnvelope } from "./notification-guards";
import {
  createNotificationEventState,
  reduceNotificationEvent,
} from "./notification-event-reducer";

type NotificationInfiniteData = InfiniteData<
  NotificationPageDto,
  string | undefined
>;
type NotificationListCache = NotificationInfiniteData | NotificationPageDto;

export type NotificationCacheEventOutcome =
  | "patched"
  | "ignored"
  | "reconcile"
  | "invalid";

function isInfiniteData(
  data: NotificationListCache,
): data is NotificationInfiniteData {
  return "pages" in data && Array.isArray(data.pages);
}

function getFilters(queryKey: QueryKey) {
  const filters = queryKey[2];
  return typeof filters === "object" && filters !== null
    ? normalizeNotificationFilters(filters)
    : normalizeNotificationFilters();
}

function matchesFilters(
  notification: NotificationPresentationDto,
  filters: ReturnType<typeof normalizeNotificationFilters>,
): boolean {
  return (
    (filters.type === undefined || filters.type === notification.type) &&
    (filters.readState === undefined ||
      (filters.readState === "read" ? notification.isRead : !notification.isRead))
  );
}

function patchPage(
  page: NotificationPageDto,
  notification: NotificationPresentationDto,
  filters: ReturnType<typeof normalizeNotificationFilters>,
): NotificationPageDto {
  const hasExisting = page.items.some(
    (item) => item.notificationId === notification.notificationId,
  );
  const items = hasExisting
    ? page.items.map((item) =>
        item.notificationId === notification.notificationId ? notification : item,
      )
    : filters.type === undefined && filters.readState === undefined
      ? [notification, ...page.items]
      : page.items;

  return {
    ...page,
    items: items.filter((item) => matchesFilters(item, filters)),
  };
}

export function applyNotificationEventToCache(
  queryClient: QueryClient,
  value: unknown,
  recentEventIds: RecentEventIds,
): NotificationCacheEventOutcome {
  if (!isRealtimeEventEnvelope(value)) return "invalid";
  if (recentEventIds.hasOrAdd(value.eventId)) return "ignored";

  let outcome: NotificationCacheEventOutcome = "patched";
  const cachedLists = queryClient.getQueriesData<NotificationListCache>({
    queryKey: notificationKeys.lists(),
  });

  for (const [queryKey, data] of cachedLists) {
    if (!data) continue;
    const filters = getFilters(queryKey);
    const items = isInfiniteData(data)
      ? data.pages.flatMap((page) => page.items)
      : data.items;
    const reduced = reduceNotificationEvent(
      createNotificationEventState({
        notifications: items,
        filter: filters,
      }),
      value,
    );

    if (reduced.outcome === "reconcile" || reduced.outcome === "filtered") {
      outcome = "reconcile";
      continue;
    }
    if (reduced.outcome !== "patched") continue;

    if (isInfiniteData(data)) {
      queryClient.setQueryData<NotificationInfiniteData>(queryKey, {
        ...data,
        pages: data.pages.map((page) =>
          patchPage(page, value.payload.notification, filters),
        ),
      });
    } else {
      queryClient.setQueryData<NotificationPageDto>(
        queryKey,
        patchPage(data, value.payload.notification, filters),
      );
    }
  }

  void queryClient.invalidateQueries({
    queryKey: notificationKeys.unreadCount(),
  });
  if (outcome === "reconcile") {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  }

  return outcome;
}

export async function reconcileNotificationQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries(
      {
        queryKey: notificationKeys.unreadCount(),
        refetchType: "active",
      },
      { throwOnError: true },
    ),
    queryClient.invalidateQueries(
      {
        queryKey: notificationKeys.lists(),
        refetchType: "active",
      },
      { throwOnError: true },
    ),
    queryClient.fetchQuery({
      queryKey: notificationKeys.preferences(),
      queryFn: getNotificationPreferences,
      staleTime: 30_000,
    }),
  ]);
}

export function clearNotificationQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: notificationKeys.all });
}
