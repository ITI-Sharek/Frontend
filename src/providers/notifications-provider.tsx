import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { createNotificationSocket } from "@/lib/socket/socket-client";
import type {
  NotificationConnectionStatus,
  RealtimeNotificationDto,
} from "@/modules/notifications";
import { notificationsService } from "@/modules/notifications/services/notifications.service";
import { AUTH_CHANGED_EVENT, storageService } from "@/services/storage.service";

interface NotificationsContextValue {
  latestNotifications: RealtimeNotificationDto[];
  unreadCount: number;
  connectionStatus: NotificationConnectionStatus;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const MAX_NOTIFICATIONS = 50;

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [latestNotifications, setLatestNotifications] = useState<
    RealtimeNotificationDto[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    useState<NotificationConnectionStatus>("idle");
  const [authVersion, setAuthVersion] = useState(0);
  const knownNotificationIds = useRef(new Set<string>());
  const inboxRequestId = useRef(0);

  const loadNotifications = useCallback(async () => {
    const requestId = ++inboxRequestId.current;
    try {
      const inbox = await notificationsService.list(MAX_NOTIFICATIONS);
      if (requestId !== inboxRequestId.current) return;
      inbox.items.forEach((notification) =>
        knownNotificationIds.current.add(notification.notificationId),
      );
      setLatestNotifications((current) => {
        const fetchedIds = new Set(
          inbox.items.map((notification) => notification.notificationId),
        );
        const liveOnly = current.filter(
          (notification) => !fetchedIds.has(notification.notificationId),
        );
        return [...liveOnly, ...inbox.items].slice(0, MAX_NOTIFICATIONS);
      });
      setUnreadCount(inbox.unreadCount);
    } catch {
      // The realtime channel can still recover independently. Do not make a
      // notification fetch failure break the rest of the application shell.
    }
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => setAuthVersion((version) => version + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
  }, []);

  useEffect(() => {
    const token = storageService.getAccessToken();
    let active = true;

    if (!token) {
      inboxRequestId.current += 1;
      setLatestNotifications([]);
      setUnreadCount(0);
      knownNotificationIds.current.clear();
      setConnectionStatus("idle");
      return () => {
        active = false;
      };
    }

    setConnectionStatus("connecting");
    void loadNotifications();

    const socket = createNotificationSocket(token);
    socket.on("connect", () => {
      if (active) setConnectionStatus("connected");
    });
    socket.on("disconnect", () => {
      if (active) setConnectionStatus("disconnected");
    });
    socket.on("connect_error", () => {
      if (active) setConnectionStatus("disconnected");
    });
    socket.on("notifications.error", () => {
      if (active) setConnectionStatus("unauthorized");
    });
    socket.on("notification.created", (notification: RealtimeNotificationDto) => {
      if (!active) return;

      const wasKnown = knownNotificationIds.current.has(
        notification.notificationId,
      );
      knownNotificationIds.current.add(notification.notificationId);
      if (!wasKnown && !notification.isRead) {
        setUnreadCount((count) => count + 1);
      }
      setLatestNotifications((current) => {
        const withoutDuplicate = current.filter(
          (item) => item.notificationId !== notification.notificationId,
        );
        return [notification, ...withoutDuplicate].slice(0, MAX_NOTIFICATIONS);
      });
    });

    socket.connect();

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [authVersion, loadNotifications]);

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      const notificationToRead = latestNotifications.find(
        (item) => item.notificationId === notificationId,
      );
      setLatestNotifications((current) =>
        current.map((notification) =>
          notification.notificationId !== notificationId || notification.isRead
            ? notification
            : {
                ...notification,
                isRead: true,
                readAt: notification.readAt ?? new Date().toISOString(),
              },
        ),
      );
      if (notificationToRead && !notificationToRead.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }

      void notificationsService.markRead(notificationId).catch(() => {
        const token = storageService.getAccessToken();
        if (token) void loadNotifications();
      });
    },
    [latestNotifications, loadNotifications],
  );

  const markAllNotificationsRead = useCallback(() => {
    const readAt = new Date().toISOString();
    setLatestNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt ?? readAt,
      })),
    );
    setUnreadCount(0);

    void notificationsService.markAllRead().catch(() => {
      const token = storageService.getAccessToken();
      if (token) void loadNotifications();
    });
  }, [loadNotifications]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      latestNotifications,
      unreadCount,
      connectionStatus,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      connectionStatus,
      latestNotifications,
      markAllNotificationsRead,
      markNotificationRead,
      unreadCount,
    ],
  );

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
