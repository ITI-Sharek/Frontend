import { axiosInstance } from "@/lib/axios/axios-instance";

import type { NotificationsInboxDto } from "../types/notification.types";

export const notificationsService = {
  async list(limit = 50): Promise<NotificationsInboxDto> {
    const { data } = await axiosInstance.get<NotificationsInboxDto>(
      "/notifications",
      { params: { limit } },
    );
    return data;
  },

  async markRead(notificationId: string): Promise<void> {
    await axiosInstance.patch(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await axiosInstance.patch("/notifications/read-all");
  },
};
