import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

import { API_BASE_URL } from "@/config/env";

export function createNotificationSocket(accessToken: string): Socket {
  return io(`${API_BASE_URL}/notifications`, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    autoConnect: false,
  });
}
