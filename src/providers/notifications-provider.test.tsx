// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Socket } from "socket.io-client";

import { playNotificationSound } from "@/lib/notification-sound";
import {
  createRealtimeSocket,
  disconnectRealtimeSocket,
} from "@/lib/socket/socket-client";
import { storageService } from "@/services/storage.service";
import type {
  CursorPage,
  MessageDto,
} from "@/modules/assignment-conversations";
import { assignmentConversationKeys } from "@/modules/assignment-conversations";
import { notificationKeys } from "@/modules/notifications";
import type { NotificationPreferencesDto } from "@/modules/notifications";
import {
  NotificationsProvider,
  useNotifications,
} from "./notifications-provider";

vi.mock("@/lib/socket/socket-client", () => ({
  createRealtimeSocket: vi.fn(),
  disconnectRealtimeSocket: vi.fn(),
}));

vi.mock("@/lib/notification-sound", () => ({
  playNotificationSound: vi.fn(),
}));

const mockedCreateRealtimeSocket = vi.mocked(createRealtimeSocket);
const mockedDisconnectRealtimeSocket = vi.mocked(disconnectRealtimeSocket);
const mockedPlayNotificationSound = vi.mocked(playNotificationSound);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

type EventHandler = (...args: unknown[]) => void;

type SocketLike = {
  auth: { token?: string };
  connected: boolean;
  io: { opts: { reconnection: boolean } };
  on: (event: string, handler: EventHandler) => SocketLike;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  removeAllListeners: ReturnType<typeof vi.fn>;
};

const notification = {
  notificationId: "11111111-1111-4111-8111-111111111111",
  type: "application_status" as const,
  templateKey: "application.accepted",
  templateVersion: 1,
  title: "Application accepted",
  body: "Your application was accepted.",
  deepLink: "/applications/11111111-1111-4111-8111-111111111111",
  priority: "attention" as const,
  isRead: false,
  readAt: null,
  createdAt: "2026-08-09T00:00:00.000Z",
  aggregateVersion: 1,
};

const createdEvent = {
  eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  type: "notification.created" as const,
  version: 1 as const,
  occurredAt: "2026-08-09T00:00:01.000Z",
  aggregateId: notification.notificationId,
  aggregateVersion: 1,
  payload: { notification },
};

const notificationPreferences: NotificationPreferencesDto = {
  retentionDays: 90,
  quietHours: {
    enabled: false,
    startLocal: null,
    endLocal: null,
    timeZone: null,
  },
  revision: 1,
  categories: [
    {
      type: "application_status",
      requiredInApp: true,
      inAppEnabled: true,
      browserEnabled: false,
    },
  ],
};

const conversationId = "55555555-5555-4555-8555-555555555555";
const messageCreatedEvent = {
  eventId: "88888888-8888-4888-8888-888888888888",
  type: "conversation.message.created" as const,
  version: 1 as const,
  occurredAt: "2026-08-09T12:03:00.000Z",
  aggregateId: conversationId,
  aggregateVersion: 1,
  payload: {
    message: {
      messageId: "66666666-6666-4666-8666-666666666666",
      conversationId,
      sequence: 1,
      senderId: "22222222-2222-4222-8222-222222222222",
      senderName: "Contributor Name",
      body: "Realtime message",
      replyToMessageId: null,
      createdAt: "2026-08-09T12:03:00.000Z",
      editedAt: null,
      retractedAt: null,
      attachments: [],
    },
  },
};

const attachmentId = "33333333-3333-4333-8333-333333333333";
const attachmentScanStateChangedEvent = {
  eventId: "99999999-9999-4999-8999-999999999999",
  type: "attachment.scan_state_changed" as const,
  version: 1 as const,
  occurredAt: "2026-08-09T12:05:00.000Z",
  aggregateId: attachmentId,
  aggregateVersion: 1,
  payload: {
    attachmentId,
    messageId: "66666666-6666-4666-8666-666666666666",
    filename: "report.pdf",
    byteSize: 2_048,
    mimeType: "application/pdf",
    caption: null,
    scanState: "ready" as const,
  },
};

function StatusProbe() {
  const { connectionStatus } = useNotifications();
  return <output data-status={connectionStatus}>{connectionStatus}</output>;
}

function getSocket(sockets: SocketLike[]): SocketLike {
  const socket = sockets.at(0);
  if (socket === undefined) throw new Error("Expected realtime socket");
  return socket;
}

describe("NotificationsProvider realtime bridge", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  let sockets: SocketLike[];

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(
      notificationKeys.preferences(),
      notificationPreferences,
    );
    sockets = [];
    storageService.clearTokens();

    mockedCreateRealtimeSocket.mockImplementation(() => {
      const handlers = new Map<string, EventHandler>();
      const socket: SocketLike = {
        auth: {},
        connected: false,
        io: { opts: { reconnection: true } },
        on: (event, callback) => {
          handlers.set(event, callback);
          return socket;
        },
        connect: vi.fn(() => {
          socket.connected = true;
        }),
        disconnect: vi.fn(() => {
          socket.connected = false;
        }),
        removeAllListeners: vi.fn(() => handlers.clear()),
      };
      Object.defineProperty(socket, "handlers", { value: handlers });
      sockets.push(socket);
      return socket as unknown as Socket;
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    queryClient.clear();
    container.remove();
    storageService.clearTokens();
    vi.clearAllMocks();
  });

  async function render() {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <NotificationsProvider>
            <StatusProbe />
          </NotificationsProvider>
        </QueryClientProvider>,
      );
    });
  }

  function handler(socket: SocketLike, event: string): EventHandler {
    const handlers = (socket as SocketLike & { handlers: Map<string, EventHandler> })
      .handlers;
    const value = handlers.get(event);
    if (!value) throw new Error(`Missing handler: ${event}`);
    return value;
  }

  it("opens after login, replaces the token with one active socket, and closes on logout", async () => {
    queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 4 });
    queryClient.setQueryData(assignmentConversationKeys.list(), {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });
    await render();
    expect(mockedCreateRealtimeSocket).not.toHaveBeenCalled();

    await act(async () => storageService.setAccessToken("token-a"));
    await act(async () => storageService.setAccessToken("token-b"));
    await act(async () => storageService.clearTokens());

    expect(mockedCreateRealtimeSocket).toHaveBeenCalledTimes(2);
    expect(mockedDisconnectRealtimeSocket).toHaveBeenCalledTimes(2);
    expect(container.querySelector("output")?.dataset.status).toBe("idle");
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toBeUndefined();
    expect(
      queryClient.getQueryData(assignmentConversationKeys.list()),
    ).toBeUndefined();
  });

  it("plays sound only for a validated unread created event", async () => {
    storageService.setAccessToken("token-a");
    await render();
    const socket = getSocket(sockets);

    await act(async () => handler(socket, "notification.created")(createdEvent));
    expect(mockedPlayNotificationSound).toHaveBeenCalledTimes(1);

    await act(async () =>
      handler(socket, "notification.created")({ type: "notification.created" }),
    );
    expect(mockedPlayNotificationSound).toHaveBeenCalledTimes(1);
  });

  it("routes committed Message events through the same socket and converges the open conversation", async () => {
    storageService.setAccessToken("token-a");
    const key = assignmentConversationKeys.messages(conversationId);
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [{ items: [], nextCursor: null }],
      pageParams: [undefined],
    });
    await render();
    const socket = getSocket(sockets);

    await act(async () =>
      handler(socket, "conversation.message.created")(messageCreatedEvent),
    );

    expect(mockedCreateRealtimeSocket).toHaveBeenCalledTimes(1);
    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items,
    ).toEqual([messageCreatedEvent.payload.message]);
  });

  function seedMessageWithAttachment(
    key: ReturnType<typeof assignmentConversationKeys.messages>,
    scanState: "scanning" | "ready",
    eventVersion: number,
  ) {
    queryClient.setQueryData<InfiniteData<CursorPage<MessageDto>>>(key, {
      pages: [
        {
          items: [
            {
              messageId: attachmentScanStateChangedEvent.payload.messageId,
              conversationId,
              sequence: 1,
              senderId: "22222222-2222-4222-8222-222222222222",
              senderName: "Contributor Name",
              body: "Here is the file",
              replyToMessageId: null,
              createdAt: "2026-08-09T12:03:00.000Z",
              editedAt: null,
              retractedAt: null,
              attachments: [
                {
                  attachmentId,
                  filename: "report.pdf",
                  byteSize: 2_048,
                  mimeType: "application/pdf",
                  caption: null,
                  scanState,
                  eventVersion,
                },
              ],
            },
          ],
          nextCursor: null,
        },
      ],
      pageParams: [undefined],
    });
  }

  it("patches the matching attachment inside the matching cached message by id and version", async () => {
    storageService.setAccessToken("token-a");
    const key = assignmentConversationKeys.messages(conversationId);
    seedMessageWithAttachment(key, "scanning", 0);
    await render();
    const socket = getSocket(sockets);

    await act(async () =>
      handler(
        socket,
        "attachment.scan_state_changed",
      )(attachmentScanStateChangedEvent),
    );

    expect(
      queryClient
        .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
        ?.pages[0]?.items[0]?.attachments,
    ).toEqual([
      {
        attachmentId,
        filename: "report.pdf",
        byteSize: 2_048,
        mimeType: "application/pdf",
        caption: null,
        scanState: "ready",
        eventVersion: 1,
      },
    ]);
  });

  it("treats a stale or duplicate scan event (aggregateVersion <= current eventVersion) as a no-op", async () => {
    storageService.setAccessToken("token-a");
    const key = assignmentConversationKeys.messages(conversationId);
    seedMessageWithAttachment(key, "ready", 3);
    await render();
    const socket = getSocket(sockets);

    await act(async () =>
      handler(
        socket,
        "attachment.scan_state_changed",
      )({
        ...attachmentScanStateChangedEvent,
        aggregateVersion: 2,
        payload: {
          ...attachmentScanStateChangedEvent.payload,
          scanState: "blocked",
        },
      }),
    );

    const attachments = queryClient
      .getQueryData<InfiniteData<CursorPage<MessageDto>>>(key)
      ?.pages[0]?.items[0]?.attachments;
    expect(attachments?.[0]?.scanState).toBe("ready");
    expect(attachments?.[0]?.eventVersion).toBe(3);
  });

  it("uses unauthorized and delayed states without looping the same token", async () => {
    storageService.setAccessToken("token-a");
    await render();
    const socket = getSocket(sockets);

    await act(async () =>
      handler(socket, "realtime.error")({ code: "REALTIME_UNAUTHORIZED" }),
    );
    expect(socket.io.opts.reconnection).toBe(false);
    expect(container.querySelector("output")?.dataset.status).toBe(
      "unauthorized",
    );

    await act(async () => handler(socket, "connect_error")(new Error("offline")));
    expect(container.querySelector("output")?.dataset.status).toBe(
      "unauthorized",
    );
  });

  it("reconciles count and visible lists after connect and focus recovery", async () => {
    storageService.setAccessToken("token-a");
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    await render();
    const socket = getSocket(sockets);

    await act(async () => {
      handler(socket, "connect")();
      window.dispatchEvent(new Event("online"));
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["notifications", "unread-count"] }),
      expect.objectContaining({ throwOnError: true }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["notifications", "list"] }),
      expect.objectContaining({ throwOnError: true }),
    );
  });
});
