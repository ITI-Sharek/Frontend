import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  getNotificationPreferences,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  setNotificationReadState,
  updateNotificationPreferences,
} from "./notifications.service";
import type {
  NotificationPageDto,
  NotificationPreferencesDto,
  NotificationPresentationDto,
} from "../types/notification.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

const presentation: NotificationPresentationDto = {
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

const page: NotificationPageDto = {
  items: [presentation],
  nextCursor: "cursor-2",
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
  categories: [],
};

describe("notifications HTTP service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists notifications with the exact cursor and filters", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: page });

    await expect(
      listNotifications({
        cursor: "cursor-1",
        limit: 50,
        readState: "unread",
        type: "application_status",
      }),
    ).resolves.toEqual(page);

    expect(mockedAxios.get).toHaveBeenCalledWith("/notifications", {
      params: {
        cursor: "cursor-1",
        limit: 50,
        readState: "unread",
        type: "application_status",
      },
    });
  });

  it("does not invent query params when listing the first page", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: page });

    await listNotifications();

    expect(mockedAxios.get).toHaveBeenCalledWith("/notifications", {
      params: {},
    });
  });

  it("loads the unread count from its dedicated authority", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { unreadCount: 3 } });

    await expect(getUnreadNotificationCount()).resolves.toEqual({
      unreadCount: 3,
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/notifications/unread-count",
    );
  });

  it("scopes the unread count to conversation activity for the Messages badge", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { unreadCount: 2 } });

    await expect(
      getUnreadNotificationCount("conversation_activity"),
    ).resolves.toEqual({ unreadCount: 2 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/notifications/unread-count",
      { params: { type: "conversation_activity" } },
    );
  });

  it("sets one notification read state through the command endpoint", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: presentation });

    await expect(
      setNotificationReadState(presentation.notificationId, "read"),
    ).resolves.toEqual(presentation);
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      `/notifications/${presentation.notificationId}/read-state`,
      { state: "read" },
    );
  });

  it("marks all retained notifications read without a client snapshot", async () => {
    const response = {
      updatedCount: 3,
      snapshotAt: "2026-08-09T00:00:00.000Z",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: response });

    await expect(markAllNotificationsRead()).resolves.toEqual(response);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/notifications/mark-all-read",
    );
  });

  it("loads and updates preferences through the versioned endpoints", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: preferences });
    mockedAxios.patch.mockResolvedValueOnce({ data: preferences });

    await expect(getNotificationPreferences()).resolves.toEqual(preferences);
    await expect(
      updateNotificationPreferences({
        expectedRevision: 1,
        retentionDays: 180,
      }),
    ).resolves.toEqual(preferences);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/me/notification-preferences",
    );
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/me/notification-preferences",
      { expectedRevision: 1, retentionDays: 180 },
    );
  });
});
