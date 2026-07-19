import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { createNotificationSocket } from "@/lib/socket/socket-client";
import type {
  NotificationConnectionStatus,
  RealtimeNotificationDto,
} from "@/modules/notifications";
import { storageService } from "@/services/storage.service";

interface NotificationsContextValue {
  latestNotifications: RealtimeNotificationDto[];
  unreadCount: number;
  connectionStatus: NotificationConnectionStatus;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [latestNotifications, setLatestNotifications] = useState<
    RealtimeNotificationDto[]
  >([]);
  const [connectionStatus, setConnectionStatus] =
    useState<NotificationConnectionStatus>("idle");

  useEffect(() => {
    const token = storageService.getAccessToken();
    if (!token) {
      setConnectionStatus("idle");
      return;
    }

    const socket = createNotificationSocket(token);

    setConnectionStatus("connecting");
    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("connect_error", () => setConnectionStatus("disconnected"));
    socket.on("notifications.error", () => setConnectionStatus("unauthorized"));
    socket.on("notification.created", (notification: RealtimeNotificationDto) => {
      setLatestNotifications((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.notificationId !== notification.notificationId,
        );
        return [notification, ...withoutDuplicate].slice(0, 50);
      });
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const value = useMemo<NotificationsContextValue>(() => {
    const unreadCount = latestNotifications.filter(
      (notification) => !notification.isRead,
    ).length;

    return {
      latestNotifications,
      unreadCount,
      connectionStatus,
      markNotificationRead: (notificationId) => {
        setLatestNotifications((current) =>
          current.map((notification) =>
            notification.notificationId === notificationId
              ? {
                  ...notification,
                  isRead: true,
                  readAt: notification.readAt ?? new Date().toISOString(),
                }
              : notification,
          ),
        );
      },
      markAllNotificationsRead: () => {
        const readAt = new Date().toISOString();
        setLatestNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? readAt,
          })),
        );
      },
    };
  }, [connectionStatus, latestNotifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const value = useContext(NotificationsContext);
  if (!value) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }
  return value;
}
