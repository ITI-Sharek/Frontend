import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { Socket } from "socket.io-client";

import {
  createRealtimeSocket,
  disconnectRealtimeSocket,
} from "@/lib/socket/socket-client";
import { RecentEventIds } from "@/lib/socket/recent-event-ids";
import { RealtimeSocketContext } from "@/lib/socket/realtime-socket-context";
import { playNotificationSound } from "@/lib/notification-sound";
import {
  applyNotificationEventToCache,
  clearNotificationQueries,
  isRealtimeEventEnvelope,
  reconcileNotificationQueries,
  shouldPlayNotificationSound,
} from "@/modules/notifications";
import type { NotificationConnectionStatus } from "@/modules/notifications";
import { accessTokenStore } from "@/services/storage.service";
import {
  applyAttachmentScanEventToCache,
  applyConversationMessageEventToCache,
  clearAssignmentConversationQueries,
  reconcileAssignmentConversationQueries,
} from "@/modules/assignment-conversations";

interface NotificationsContextValue {
  connectionStatus: NotificationConnectionStatus;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function getRealtimeErrorCode(value: unknown): string | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const code = (value as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const accessToken = useSyncExternalStore(
    accessTokenStore.subscribe,
    accessTokenStore.getSnapshot,
    accessTokenStore.getServerSnapshot,
  );
  const queryClient = useQueryClient();
  const recentEventIdsRef = useRef(new RecentEventIds());
  const [connectionStatus, setConnectionStatus] =
    useState<NotificationConnectionStatus>("idle");
  // Exposed read-only via `RealtimeSocketContext` so other providers/modules
  // can subscribe to further events on this same connection. Lifecycle
  // ownership (creation, auth, the `REALTIME_UNAUTHORIZED` hard-stop) stays
  // entirely in the effect below, unchanged -- this is purely a read handle.
  const [socketState, setSocketState] = useState<Socket | null>(null);

  useEffect(() => {
    let active = true;
    let unauthorized = false;

    function setStatusIfActive(status: NotificationConnectionStatus) {
      if (!active) return;
      setConnectionStatus(status);
    }

    async function reconcile() {
      if (!active) return;
      setConnectionStatus("synchronizing");

      try {
        await Promise.all([
          reconcileNotificationQueries(queryClient),
          reconcileAssignmentConversationQueries(queryClient),
        ]);
        setStatusIfActive("connected");
      } catch {
        setStatusIfActive("delayed");
      }
    }

    function handleNetworkRecovery() {
      void reconcile();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void reconcile();
    }

    window.addEventListener("online", handleNetworkRecovery);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!accessToken) {
      clearNotificationQueries(queryClient);
      clearAssignmentConversationQueries(queryClient);
      setConnectionStatus("idle");
      setSocketState(null);
      return () => {
        window.removeEventListener("online", handleNetworkRecovery);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    const socket = createRealtimeSocket(accessToken);
    setConnectionStatus("connecting");
    setSocketState(socket);

    socket.on("connect", () => {
      void reconcile();
    });
    socket.on("disconnect", () => {
      if (active) setConnectionStatus("delayed");
    });
    socket.on("connect_error", () => {
      if (!unauthorized) setStatusIfActive("delayed");
    });
    socket.on("realtime.error", (error: unknown) => {
      if (getRealtimeErrorCode(error) === "REALTIME_UNAUTHORIZED") {
        unauthorized = true;
        socket.io.opts.reconnection = false;
        socket.disconnect();
        setStatusIfActive("unauthorized");
        return;
      }
      setStatusIfActive("delayed");
    });

    const handleRealtimeEvent = (event: unknown) => {
      if (!isRealtimeEventEnvelope(event)) {
        void reconcile();
        return;
      }

      if (
        event.type === "notification.created" &&
        shouldPlayNotificationSound(queryClient, event.payload.notification)
      ) {
        playNotificationSound();
      }

      const outcome = applyNotificationEventToCache(
        queryClient,
        event,
        recentEventIdsRef.current,
      );
      if (outcome === "reconcile" || outcome === "invalid") {
        void reconcile();
      }
    };

    socket.on("notification.created", handleRealtimeEvent);
    socket.on("notification.read_state_changed", handleRealtimeEvent);
    socket.on("conversation.message.created", (event: unknown) => {
      const outcome = applyConversationMessageEventToCache(
        queryClient,
        event,
        recentEventIdsRef.current,
      );
      if (outcome === "reconcile" || outcome === "invalid") {
        void reconcile();
      }
    });
    socket.on("attachment.scan_state_changed", (event: unknown) => {
      const outcome = applyAttachmentScanEventToCache(
        queryClient,
        event,
        recentEventIdsRef.current,
      );
      if (outcome === "reconcile" || outcome === "invalid") {
        void reconcile();
      }
    });
    socket.connect();

    return () => {
      active = false;
      window.removeEventListener("online", handleNetworkRecovery);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disconnectRealtimeSocket(socket);
    };
  }, [accessToken, queryClient]);

  const value = useMemo<NotificationsContextValue>(
    () => ({ connectionStatus }),
    [connectionStatus],
  );
  const realtimeSocketValue = useMemo(
    () => ({ socket: socketState, connectionStatus }),
    [socketState, connectionStatus],
  );

  return (
    <NotificationsContext.Provider value={value}>
      <RealtimeSocketContext.Provider value={realtimeSocketValue}>
        {children}
      </RealtimeSocketContext.Provider>
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
