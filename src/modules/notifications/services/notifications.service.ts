import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  ListNotificationsInput,
  MarkAllNotificationsReadResponseDto,
  NotificationPageDto,
  NotificationPreferencesDto,
  NotificationReadStateResponseDto,
  NotificationUnreadCountDto,
  NotificationType,
  UpdateNotificationPreferencesDto,
} from "../types/notification.types";

export async function listNotifications(
  input: ListNotificationsInput = {},
): Promise<NotificationPageDto> {
  const params: ListNotificationsInput = {};
  if (input.cursor !== undefined) params.cursor = input.cursor;
  if (input.limit !== undefined) params.limit = input.limit;
  if (input.readState !== undefined) params.readState = input.readState;
  if (input.type !== undefined) params.type = input.type;

  const { data } = await axiosInstance.get<NotificationPageDto>(
    "/notifications",
    { params },
  );
  return data;
}

export async function getUnreadNotificationCount(
  type?: NotificationType,
): Promise<NotificationUnreadCountDto> {
  const { data } =
    type === undefined
      ? await axiosInstance.get<NotificationUnreadCountDto>(
          "/notifications/unread-count",
        )
      : await axiosInstance.get<NotificationUnreadCountDto>(
          "/notifications/unread-count",
          { params: { type } },
        );
  return data;
}

export async function setNotificationReadState(
  notificationId: string,
  state: "read" | "unread",
): Promise<NotificationReadStateResponseDto> {
  const { data } = await axiosInstance.patch<NotificationReadStateResponseDto>(
    `/notifications/${encodeURIComponent(notificationId)}/read-state`,
    { state },
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResponseDto> {
  const { data } =
    await axiosInstance.post<MarkAllNotificationsReadResponseDto>(
      "/notifications/mark-all-read",
    );
  return data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesDto> {
  const { data } = await axiosInstance.get<NotificationPreferencesDto>(
    "/me/notification-preferences",
  );
  return data;
}

export async function updateNotificationPreferences(
  patch: UpdateNotificationPreferencesDto,
): Promise<NotificationPreferencesDto> {
  const { data } = await axiosInstance.patch<NotificationPreferencesDto>(
    "/me/notification-preferences",
    patch,
  );
  return data;
}

export const notificationsService = {
  async list(limit = 50) {
    const page = await listNotifications({ limit });
    return {
      items: page.items,
      unreadCount: page.unreadCount ?? 0,
    };
  },

  async markRead(notificationId: string): Promise<void> {
    await setNotificationReadState(notificationId, "read");
  },

  async markAllRead(): Promise<void> {
    await markAllNotificationsRead();
  },
};
