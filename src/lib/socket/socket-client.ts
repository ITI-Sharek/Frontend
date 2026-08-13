import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

import { API_BASE_URL } from "@/config/env";

function normalizeBearerToken(accessToken: string): string {
  const trimmed = accessToken.trim();
  return trimmed.replace(/^bearer\s+/i, "");
}

export function createRealtimeSocket(accessToken: string): Socket {
  return io(`${API_BASE_URL}/realtime`, {
    auth: { token: normalizeBearerToken(accessToken) },
    transports: ["websocket"],
    autoConnect: false,
  });
}

export function replaceRealtimeSocketToken(
  socket: Socket,
  accessToken: string,
): void {
  socket.auth = {
    ...socket.auth,
    token: normalizeBearerToken(accessToken),
  };

  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
}

export function disconnectRealtimeSocket(socket: Socket): void {
  const removableSocket = socket as unknown as {
    removeAllListeners?: () => Socket;
  };
  removableSocket.removeAllListeners?.();
  socket.disconnect();
}
