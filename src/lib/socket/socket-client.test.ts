import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Socket } from "socket.io-client";

import { io } from "socket.io-client";
import { API_BASE_URL } from "@/config/env";

import {
  createRealtimeSocket,
  disconnectRealtimeSocket,
  replaceRealtimeSocketToken,
} from "./socket-client";

vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

const mockedIo = vi.mocked(io);

describe("realtime socket wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("connects to the shared realtime namespace with websocket-only transport", () => {
    const socket = {} as Socket;
    mockedIo.mockReturnValueOnce(socket);

    expect(createRealtimeSocket("access-token")).toBe(socket);
    expect(mockedIo).toHaveBeenCalledWith(`${API_BASE_URL}/realtime`, {
      auth: { token: "access-token" },
      transports: ["websocket"],
      autoConnect: false,
    });
  });

  it("replaces the bearer token on an existing socket and reconnects it", () => {
    const socket = {
      auth: { token: "old-token" },
      connected: true,
      disconnect: vi.fn(),
      connect: vi.fn(),
    } as unknown as Socket;

    replaceRealtimeSocketToken(socket, "new-token");

    expect(socket.auth).toEqual({ token: "new-token" });
    expect(socket.disconnect).toHaveBeenCalledWith();
    expect(socket.connect).toHaveBeenCalledWith();
  });

  it("cleans up a socket exactly once", () => {
    const socket = {
      removeAllListeners: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as Socket;

    disconnectRealtimeSocket(socket);
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });
});
