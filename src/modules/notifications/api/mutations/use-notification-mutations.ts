import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { InfiniteData, QueryKey, QueryClient } from "@tanstack/react-query";

import {
  markAllNotificationsRead,
  setNotificationReadState,
  updateNotificationPreferences,
} from "../../services/notifications.service";
import type {
  NotificationPageDto,
  NotificationPresentationDto,
  NotificationUnreadCountDto,
  UpdateNotificationPreferencesDto,
} from "../../types/notification.types";
import {
  normalizeNotificationFilters,
  notificationKeys,
} from "../query-keys";
import type { NormalizedNotificationFilters } from "../query-keys";

type NotificationInfiniteData = InfiniteData<
  NotificationPageDto,
  string | undefined
>;

type NotificationListData = NotificationInfiniteData | NotificationPageDto;
type NotificationListSnapshot = [QueryKey, NotificationListData | undefined];

type NotificationMutationContext = {
  listSnapshots: NotificationListSnapshot[];
  unreadCount: NotificationUnreadCountDto | undefined;
};

function getNotificationListSnapshots(
  queryClient: QueryClient,
): NotificationListSnapshot[] {
  return queryClient.getQueriesData<NotificationListData>({
    queryKey: notificationKeys.lists(),
  });
}

function isInfiniteNotificationData(
  data: NotificationListData,
): data is NotificationInfiniteData {
  return "pages" in data && Array.isArray(data.pages);
}

function updateNotificationItems(
  items: NotificationPresentationDto[],
  filters: NormalizedNotificationFilters,
  updateItem: (
    item: NotificationPresentationDto,
  ) => NotificationPresentationDto | null,
): NotificationPresentationDto[] {
  return items
    .map(updateItem)
    .filter(
      (item): item is NotificationPresentationDto =>
        item !== null &&
        (filters.readState === undefined ||
          (filters.readState === "read" ? item.isRead : !item.isRead)),
    );
}

function getListFilters(queryKey: QueryKey): NormalizedNotificationFilters {
  const filters = queryKey[2];
  return typeof filters === "object" && filters !== null
    ? normalizeNotificationFilters(filters)
    : normalizeNotificationFilters();
}

function updateNotificationLists(
  queryClient: QueryClient,
  updateItem: (
    item: NotificationPresentationDto,
  ) => NotificationPresentationDto | null,
) {
  for (const [queryKey, data] of getNotificationListSnapshots(queryClient)) {
    if (!data) continue;
    const filters = getListFilters(queryKey);
    if (isInfiniteNotificationData(data)) {
      queryClient.setQueryData<NotificationInfiniteData>(queryKey, {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: updateNotificationItems(page.items, filters, updateItem),
        })),
      });
      continue;
    }

    queryClient.setQueryData<NotificationPageDto>(queryKey, {
      ...data,
      items: updateNotificationItems(data.items, filters, updateItem),
    });
  }
}

function getNotificationListItems(
  data: NotificationListData | undefined,
): NotificationPresentationDto[] {
  if (!data) return [];
  return isInfiniteNotificationData(data)
    ? data.pages.flatMap((page) => page.items)
    : data.items;
}

function snapshotNotificationCaches(
  queryClient: QueryClient,
): NotificationMutationContext {
  return {
    listSnapshots: getNotificationListSnapshots(queryClient),
    unreadCount: queryClient.getQueryData<NotificationUnreadCountDto>(
      notificationKeys.unreadCount(),
    ),
  };
}

function restoreNotificationCaches(
  queryClient: QueryClient,
  context: NotificationMutationContext | undefined,
) {
  if (!context) return;
  for (const [queryKey, data] of context.listSnapshots) {
    queryClient.setQueryData(queryKey, data);
  }
  queryClient.setQueryData(notificationKeys.unreadCount(), context.unreadCount);
}

function invalidateNotificationQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.unreadCount(),
  });
}

function updateUnreadCount(
  queryClient: QueryClient,
  delta: number,
) {
  const current = queryClient.getQueryData<NotificationUnreadCountDto>(
    notificationKeys.unreadCount(),
  );
  if (!current) return;
  queryClient.setQueryData(notificationKeys.unreadCount(), {
    unreadCount: Math.max(0, current.unreadCount + delta),
  });
}

export function useSetNotificationReadStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      state,
    }: {
      notificationId: string;
      state: "read" | "unread";
    }) => setNotificationReadState(notificationId, state),
    onMutate: ({ notificationId, state }) => {
      const context = snapshotNotificationCaches(queryClient);
      const currentItem = context.listSnapshots
        .flatMap(([, data]) => getNotificationListItems(data))
        .find((item) => item.notificationId === notificationId);

      if (currentItem && currentItem.isRead !== (state === "read")) {
        updateUnreadCount(queryClient, state === "read" ? -1 : 1);
      }

      const readAt = state === "read" ? new Date().toISOString() : null;
      updateNotificationLists(queryClient, (item) =>
        item.notificationId === notificationId
          ? { ...item, isRead: state === "read", readAt }
          : item,
      );

      return context;
    },
    onSuccess: (notification) => {
      updateNotificationLists(queryClient, (item) =>
        item.notificationId === notification.notificationId ? notification : item,
      );
    },
    onError: (_error, _variables, context) => {
      restoreNotificationCaches(queryClient, context);
    },
    onSettled: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      const context = snapshotNotificationCaches(queryClient);
      const currentCount = context.unreadCount?.unreadCount ?? 0;
      updateNotificationLists(queryClient, (item) =>
        item.isRead
          ? item
          : { ...item, isRead: true, readAt: new Date().toISOString() },
      );
      if (context.unreadCount) {
        queryClient.setQueryData(notificationKeys.unreadCount(), {
          unreadCount: 0,
        });
      }
      return { ...context, currentCount };
    },
    onError: (_error, _variables, context) => {
      restoreNotificationCaches(queryClient, context);
    },
    onSettled: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateNotificationPreferencesDto) =>
      updateNotificationPreferences(patch),
    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationKeys.preferences(), preferences);
    },
  });
}
