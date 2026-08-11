import { describe, expect, it } from "vitest";

import {
  isNotificationPresentationDto,
  isRealtimeEventEnvelope,
} from "./notification-guards";
import { getSafeNotificationLink } from "./safe-notification-link";

const presentation = {
  notificationId: "11111111-1111-4111-8111-111111111111",
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

const envelope = {
  eventId: "22222222-2222-4222-8222-222222222222",
  type: "notification.created",
  version: 1,
  occurredAt: "2026-08-09T00:00:00.000Z",
  aggregateId: presentation.notificationId,
  aggregateVersion: 1,
  payload: { notification: presentation },
};

describe("Notification runtime guards", () => {
  it("accepts a complete version-one presentation and envelope", () => {
    expect(isNotificationPresentationDto(presentation)).toBe(true);
    expect(isRealtimeEventEnvelope(envelope)).toBe(true);
    expect(
      isNotificationPresentationDto({
        ...presentation,
        type: "skill_profile_generation",
        templateKey: "skill_profile_generation.ready_for_review",
      }),
    ).toBe(true);
    expect(
      isNotificationPresentationDto({
        ...presentation,
        type: "future_backend_category",
      }),
    ).toBe(true);
  });

  it("rejects incomplete or unsupported presentation payloads", () => {
    expect(
      isNotificationPresentationDto({ ...presentation, body: undefined }),
    ).toBe(false);
    expect(
      isNotificationPresentationDto({ ...presentation, priority: "critical" }),
    ).toBe(false);
    expect(
      isNotificationPresentationDto({ ...presentation, readAt: "not-a-date" }),
    ).toBe(false);
    expect(
      isRealtimeEventEnvelope({ ...envelope, version: 2 }),
    ).toBe(false);
    expect(
      isRealtimeEventEnvelope({
        ...envelope,
        type: "notification.deleted",
      }),
    ).toBe(false);
  });
});

describe("safe notification links", () => {
  it("keeps only same-origin root-relative links", () => {
    expect(
      getSafeNotificationLink("/applications/application-1", "https://sharek.test"),
    ).toBe("/applications/application-1");
    expect(getSafeNotificationLink(null, "https://sharek.test")).toBeNull();
    expect(getSafeNotificationLink("//evil.test/phishing", "https://sharek.test")).toBeNull();
    expect(
      getSafeNotificationLink("https://evil.test/phishing", "https://sharek.test"),
    ).toBeNull();
    expect(
      getSafeNotificationLink("https://sharek.test:443/account", "https://sharek.test"),
    ).toBeNull();
  });
});
