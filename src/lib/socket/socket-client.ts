import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

export function createNotificationSocket(accessToken: string): Socket {
  const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:3000")
    .replace(/\/+$/, "");

  return io(`${apiUrl}/notifications`, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    autoConnect: false,
  });
}
