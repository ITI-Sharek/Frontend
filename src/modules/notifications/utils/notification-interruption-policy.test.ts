import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { notificationKeys } from "../api/query-keys";
import type {
  NotificationPreferencesDto,
  NotificationPresentationDto,
} from "../types/notification.types";
import { shouldPlayNotificationSound } from "./notification-interruption-policy";

const notification: NotificationPresentationDto = {
  notificationId: "11111111-1111-4111-8111-111111111111",
  type: "skill_profile_generation",
  templateKey: "skill_profile_generation.ready_for_review",
  templateVersion: 1,
  title: "Skill analysis ready for review",
  body: "Your skill analysis is complete.",
  deepLink: "/skills",
  priority: "attention",
  isRead: false,
  readAt: null,
  createdAt: "2026-08-10T18:00:00.000Z",
  aggregateVersion: 1,
};

const preferences: NotificationPreferencesDto = {
  retentionDays: 90,
  quietHours: {
    enabled: false,
    startLocal: null,
    endLocal: null,
    timeZone: null,
  },
  revision: 1,
  categories: [
    {
      type: "skill_profile_generation",
      requiredInApp: false,
      inAppEnabled: true,
      browserEnabled: false,
    },
  ],
};

function createQueryClient(value = preferences) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(notificationKeys.preferences(), value);
  return queryClient;
}

describe("notification interruption policy", () => {
  it("plays only attention-worthy enabled categories with loaded preferences", () => {
    const queryClient = createQueryClient();
    expect(shouldPlayNotificationSound(queryClient, notification)).toBe(true);
    expect(
      shouldPlayNotificationSound(queryClient, {
        ...notification,
        priority: "ambient",
      }),
    ).toBe(false);
    expect(
      shouldPlayNotificationSound(queryClient, {
        ...notification,
        isRead: true,
      }),
    ).toBe(false);
    expect(shouldPlayNotificationSound(new QueryClient(), notification)).toBe(
      false,
    );
  });

  it("suppresses optional disabled categories", () => {
    const queryClient = createQueryClient({
      ...preferences,
      categories: [
        {
          ...preferences.categories[0],
          inAppEnabled: false,
        },
      ],
    });
    expect(shouldPlayNotificationSound(queryClient, notification)).toBe(false);
  });

  it("suppresses overnight quiet hours in the selected timezone", () => {
    const queryClient = createQueryClient({
      ...preferences,
      quietHours: {
        enabled: true,
        startLocal: "22:00",
        endLocal: "06:00",
        timeZone: "Africa/Cairo",
      },
    });

    expect(
      shouldPlayNotificationSound(
        queryClient,
        notification,
        new Date("2026-08-10T21:30:00.000Z"),
      ),
    ).toBe(false);
    expect(
      shouldPlayNotificationSound(
        queryClient,
        notification,
        new Date("2026-08-10T12:00:00.000Z"),
      ),
    ).toBe(true);
  });
});
