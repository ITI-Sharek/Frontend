import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { normalizeNotificationFilters, notificationKeys } from "../api/query-keys";
import type { NotificationPageDto } from "../types/notification.types";
import {
  applyNotificationEventToCache,
} from "./notification-event-cache";

const notification = {
  notificationId: "11111111-1111-4111-8111-111111111111",
  type: "application_status" as const,
  templateKey: "application.accepted",
  templateVersion: 1,
  title: "Application accepted",
  body: "Your application was accepted.",
  deepLink: "/applications/11111111-1111-4111-8111-111111111111",
  priority: "attention" as const,
  isRead: false,
  readAt: null,
  createdAt: "2026-08-09T00:00:00.000Z",
  aggregateVersion: 1,
};

function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData<NotificationPageDto>(
    notificationKeys.list(normalizeNotificationFilters()),
    { items: [notification], nextCursor: null },
  );
  return queryClient;
}

function createdEvent(overrides: Record<string, unknown> = {}) {
  return {
    eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    type: "notification.created",
    version: 1,
    occurredAt: "2026-08-09T00:00:01.000Z",
    aggregateId: notification.notificationId,
    aggregateVersion: 2,
    payload: {
      notification: { ...notification, aggregateVersion: 2 },
    },
    ...overrides,
  };
}

describe("notification event cache bridge", () => {
  it("patches a contiguous event and invalidates the authoritative count", () => {
    const queryClient = createQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const outcome = applyNotificationEventToCache(
      queryClient,
      createdEvent({
        type: "notification.read_state_changed",
        payload: {
          notification: {
            ...notification,
            aggregateVersion: 2,
            isRead: true,
            readAt: "2026-08-09T00:02:00.000Z",
          },
        },
      }),
      new RecentEventIds(),
    );

    expect(outcome).toBe("patched");
    expect(
      queryClient.getQueryData<NotificationPageDto>(
        notificationKeys.list(normalizeNotificationFilters()),
      )?.items[0]?.isRead,
    ).toBe(true);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.unreadCount(),
    });
  });

  it("suppresses duplicates and reconciles aggregate gaps", () => {
    const queryClient = createQueryClient();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const recentEventIds = new RecentEventIds();
    const first = applyNotificationEventToCache(
      queryClient,
      createdEvent(),
      recentEventIds,
    );
    const duplicate = applyNotificationEventToCache(
      queryClient,
      createdEvent(),
      recentEventIds,
    );
    const gap = applyNotificationEventToCache(
      queryClient,
      createdEvent({
        eventId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        aggregateVersion: 4,
        payload: {
          notification: { ...notification, aggregateVersion: 4 },
        },
      }),
      recentEventIds,
    );

    expect(first).toBe("patched");
    expect(duplicate).toBe("ignored");
    expect(gap).toBe("reconcile");
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.lists(),
    });
  });
});
