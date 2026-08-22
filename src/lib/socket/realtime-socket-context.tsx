import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

import type { NotificationConnectionStatus } from "@/modules/notifications";

export interface RealtimeSocketContextValue {
  /** `null` when signed out or before the socket has been created. */
  socket: Socket | null;
  connectionStatus: NotificationConnectionStatus;
}

/**
 * Read-only access to the single shared realtime socket. `NotificationsProvider`
 * remains the only owner of the socket's lifecycle (creation, auth, the
 * `REALTIME_UNAUTHORIZED` hard-stop) -- this context just exposes what it
 * already holds so other providers/modules (starting with assignment calls)
 * can subscribe to additional events on the same connection instead of
 * opening a second one.
 */
export const RealtimeSocketContext = createContext<RealtimeSocketContextValue | null>(
  null,
);

export function useRealtimeSocket(): RealtimeSocketContextValue {
  const value = useContext(RealtimeSocketContext);
  if (!value) {
    throw new Error("useRealtimeSocket must be used inside NotificationsProvider");
  }
  return value;
}
