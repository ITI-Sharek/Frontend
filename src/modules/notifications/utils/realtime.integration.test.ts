import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";

import { normalizeNotificationFilters, notificationKeys } from "../api/query-keys";
import type { NotificationPageDto } from "../types/notification.types";
import { applyNotificationEventToCache } from "./notification-event-cache";

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

function makeTab() {
  const client = new QueryClient();
  client.setQueryData<NotificationPageDto>(
    notificationKeys.list(normalizeNotificationFilters()),
    { items: [notification], nextCursor: null },
  );
  return { client, recentEventIds: new RecentEventIds() };
}

function readEvent(version: number, eventId: string, isRead: boolean) {
  return {
    eventId,
    type: "notification.read_state_changed",
    version: 1,
    occurredAt: `2026-08-09T00:00:0${version}.000Z`,
    aggregateId: notification.notificationId,
    aggregateVersion: version,
    payload: {
      notification: {
        ...notification,
        aggregateVersion: version,
        isRead,
        readAt: isRead ? `2026-08-09T00:00:0${version}.000Z` : null,
      },
    },
  };
}

describe("realtime convergence fixture", () => {
  it("converges two tabs after duplicate, out-of-order, offline, and reconnect delivery", () => {
    const firstTab = makeTab();
    const secondTab = makeTab();
    const versionTwo = readEvent(2, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", true);
    const versionThree = readEvent(
      3,
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      false,
    );

    expect(
      applyNotificationEventToCache(
        firstTab.client,
        versionTwo,
        firstTab.recentEventIds,
      ),
    ).toBe("patched");
    expect(
      applyNotificationEventToCache(
        firstTab.client,
        versionTwo,
        firstTab.recentEventIds,
      ),
    ).toBe("ignored");

    expect(
      applyNotificationEventToCache(
        secondTab.client,
        versionThree,
        secondTab.recentEventIds,
      ),
    ).toBe("reconcile");

    // The durable HTTP recovery response is the authority after an offline gap.
    secondTab.client.setQueryData<NotificationPageDto>(
      notificationKeys.list(normalizeNotificationFilters()),
      {
        items: [versionThree.payload.notification],
        nextCursor: null,
      },
    );
    expect(
      applyNotificationEventToCache(
        firstTab.client,
        versionThree,
        firstTab.recentEventIds,
      ),
    ).toBe("patched");

    const firstSnapshot = firstTab.client.getQueryData<NotificationPageDto>(
      notificationKeys.list(normalizeNotificationFilters()),
    );
    const secondSnapshot = secondTab.client.getQueryData<NotificationPageDto>(
      notificationKeys.list(normalizeNotificationFilters()),
    );
    expect(firstSnapshot?.items[0]).toEqual(secondSnapshot?.items[0]);
  });
});
