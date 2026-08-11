import type {
  NotificationFilters,
  NotificationPresentationDto,
} from "../types/notification.types";
import { isRealtimeEventEnvelope } from "./notification-guards";

export type NotificationEventOutcome =
  | "patched"
  | "duplicate"
  | "stale"
  | "reconcile"
  | "filtered"
  | "invalid";

export interface NotificationEventState {
  notifications: NotificationPresentationDto[];
  unreadCount: number | null;
  recentEventIds: readonly string[];
  filter?: NotificationFilters;
  maxRecentEventIds: number;
}

export interface NotificationEventStateInput {
  notifications?: NotificationPresentationDto[];
  unreadCount?: number | null;
  recentEventIds?: readonly string[];
  filter?: NotificationFilters;
  maxRecentEventIds?: number;
}

export interface NotificationEventReducerResult {
  outcome: NotificationEventOutcome;
  state: NotificationEventState;
}

const DEFAULT_MAX_RECENT_EVENT_IDS = 1_000;

export function createNotificationEventState(
  input: NotificationEventStateInput = {},
): NotificationEventState {
  const maxRecentEventIds = Math.max(
    1,
    input.maxRecentEventIds ?? DEFAULT_MAX_RECENT_EVENT_IDS,
  );

  return {
    notifications: [...(input.notifications ?? [])],
    unreadCount: input.unreadCount ?? null,
    recentEventIds: [...(input.recentEventIds ?? [])].slice(-maxRecentEventIds),
    ...(input.filter ? { filter: input.filter } : {}),
    maxRecentEventIds,
  };
}

function rememberEvent(
  state: NotificationEventState,
  eventId: string,
): NotificationEventState {
  return {
    ...state,
    recentEventIds: [...state.recentEventIds, eventId].slice(
      -state.maxRecentEventIds,
    ),
  };
}

function updateUnreadCount(
  unreadCount: number | null,
  previous: boolean,
  next: boolean,
): number | null {
  if (unreadCount === null || previous === next) return unreadCount;
  return Math.max(0, unreadCount + (next ? 1 : -1));
}

function matchesFilter(
  notification: NotificationPresentationDto,
  filter: NotificationFilters | undefined,
): boolean {
  if (!filter) return true;
  if (filter.type !== undefined && filter.type !== notification.type) return false;
  if (filter.readState === "read" && !notification.isRead) return false;
  if (filter.readState === "unread" && notification.isRead) return false;
  return true;
}

function patchExistingNotification(
  state: NotificationEventState,
  notification: NotificationPresentationDto,
): NotificationEventState {
  const previous = state.notifications.find(
    (item) => item.notificationId === notification.notificationId,
  );
  const notifications = state.notifications
    .map((item) =>
      item.notificationId === notification.notificationId ? notification : item,
    )
    .filter((item) => matchesFilter(item, state.filter));

  return {
    ...state,
    notifications,
    unreadCount:
      previous === undefined
        ? state.unreadCount
        : updateUnreadCount(
            state.unreadCount,
            !previous.isRead,
            !notification.isRead,
          ),
  };
}

export function reduceNotificationEvent(
  state: NotificationEventState,
  value: unknown,
): NotificationEventReducerResult {
  if (!isRealtimeEventEnvelope(value)) {
    return { outcome: "invalid", state };
  }

  const event = value;
  if (state.recentEventIds.includes(event.eventId)) {
    return { outcome: "duplicate", state };
  }

  const rememberedState = rememberEvent(state, event.eventId);
  const notification = event.payload.notification;
  const existing = state.notifications.find(
    (item) => item.notificationId === notification.notificationId,
  );

  if (!existing) {
    if (event.type === "notification.read_state_changed") {
      return { outcome: "reconcile", state: rememberedState };
    }
    if (event.aggregateVersion !== 1) {
      return { outcome: "reconcile", state: rememberedState };
    }
    if (state.filter) {
      return {
        outcome: "filtered",
        state: {
          ...rememberedState,
          unreadCount: notification.isRead
            ? state.unreadCount
            : (state.unreadCount ?? 0) + 1,
        },
      };
    }

    return {
      outcome: "patched",
      state: {
        ...rememberedState,
        notifications: [notification, ...state.notifications],
        unreadCount: notification.isRead
          ? state.unreadCount
          : (state.unreadCount ?? 0) + 1,
      },
    };
  }

  if (event.aggregateVersion <= existing.aggregateVersion) {
    return { outcome: "stale", state: rememberedState };
  }
  if (event.aggregateVersion !== existing.aggregateVersion + 1) {
    return { outcome: "reconcile", state: rememberedState };
  }

  return {
    outcome: "patched",
    state: patchExistingNotification(rememberedState, notification),
  };
}
