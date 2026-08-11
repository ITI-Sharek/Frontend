import { describe, expect, it } from "vitest";

import type {
  NotificationPresentationDto,
  RealtimeEventEnvelope,
} from "../types/notification.types";
import {
  createNotificationEventState,
  reduceNotificationEvent,
} from "./notification-event-reducer";

const notificationId = "11111111-1111-4111-8111-111111111111";

const notification: NotificationPresentationDto = {
  notificationId,
  type: "application_status",
  templateKey: "application.accepted",
  templateVersion: 1,
  title: "Application accepted",
  body: "Your application was accepted.",
  deepLink: "/applications/11111111-1111-4111-8111-111111111111",
  priority: "attention",
  isRead: false,
  readAt: null,
  createdAt: "2026-08-09T00:00:00.000Z",
  aggregateVersion: 1,
};

function event(
  overrides: Partial<RealtimeEventEnvelope<{ notification: NotificationPresentationDto }>> = {},
): RealtimeEventEnvelope<{ notification: NotificationPresentationDto }> {
  return {
    eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    type: "notification.created",
    version: 1,
    occurredAt: "2026-08-09T00:00:01.000Z",
    aggregateId: notificationId,
    aggregateVersion: notification.aggregateVersion,
    payload: { notification },
    ...overrides,
  };
}

describe("notification event reducer", () => {
  it("patches a valid first created event and updates the unread count", () => {
    const result = reduceNotificationEvent(
      createNotificationEventState({ unreadCount: 0 }),
      event(),
    );

    expect(result.outcome).toBe("patched");
    expect(result.state.notifications).toEqual([notification]);
    expect(result.state.unreadCount).toBe(1);
  });

  it("ignores duplicate event IDs and keeps recent IDs bounded", () => {
    const first = reduceNotificationEvent(
      createNotificationEventState({ unreadCount: 0 }),
      event(),
    );
    const duplicate = reduceNotificationEvent(first.state, event());

    expect(duplicate.outcome).toBe("duplicate");
    expect(duplicate.state.notifications).toHaveLength(1);

    let state = createNotificationEventState({ maxRecentEventIds: 3 });
    for (let index = 0; index < 5; index += 1) {
      state = reduceNotificationEvent(
        state,
        event({
          eventId: `aaaaaaaa-aaaa-4aaa-8aaa-${String(index).padStart(12, "0")}`,
          aggregateId: `11111111-1111-4111-8111-11111111111${index}`,
          payload: {
            notification: {
              ...notification,
              notificationId: `11111111-1111-4111-8111-11111111111${index}`,
            },
          },
        }),
      ).state;
    }
    expect(state.recentEventIds).toHaveLength(3);
  });

  it("ignores stale versions and patches only contiguous versions", () => {
    const current = { ...notification, aggregateVersion: 2 };
    const stale = reduceNotificationEvent(
      createNotificationEventState({ notifications: [current] }),
      event({ aggregateVersion: 2, payload: { notification: current } }),
    );
    expect(stale.outcome).toBe("stale");

    const next = {
      ...notification,
      aggregateVersion: 3,
      title: "Application accepted (updated)",
    };
    const contiguous = reduceNotificationEvent(
      createNotificationEventState({ notifications: [current] }),
      event({
        aggregateVersion: 3,
        payload: { notification: next },
      }),
    );
    expect(contiguous.outcome).toBe("patched");
    expect(contiguous.state.notifications[0]).toEqual(next);
  });

  it("requests reconciliation for aggregate gaps", () => {
    const result = reduceNotificationEvent(
      createNotificationEventState({ notifications: [notification] }),
      event({
        aggregateVersion: 3,
        payload: {
          notification: { ...notification, aggregateVersion: 3 },
        },
      }),
    );

    expect(result.outcome).toBe("reconcile");
    expect(result.state.notifications).toEqual([notification]);
  });

  it("rejects malformed and unknown envelopes without changing state", () => {
    const initial = createNotificationEventState({ notifications: [notification] });
    const malformed = reduceNotificationEvent(initial, { type: "notification.created" });
    const unknown = reduceNotificationEvent(
      initial,
      event({ type: "notification.unknown" as never }),
    );

    expect(malformed.outcome).toBe("invalid");
    expect(unknown.outcome).toBe("invalid");
    expect(unknown.state).toEqual(initial);
  });

  it("does not synthesize an item into a filtered list", () => {
    const result = reduceNotificationEvent(
      createNotificationEventState({
        filter: { limit: 20, type: "skill_review" },
      }),
      event(),
    );

    expect(result.outcome).toBe("filtered");
    expect(result.state.notifications).toEqual([]);
  });
});
