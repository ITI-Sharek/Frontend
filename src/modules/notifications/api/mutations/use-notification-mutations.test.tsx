// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  markAllNotificationsRead,
  setNotificationReadState,
} from "../../services/notifications.service";
import type {
  NotificationPageDto,
  NotificationPresentationDto,
} from "../../types/notification.types";
import { normalizeNotificationFilters, notificationKeys } from "../query-keys";
import {
  useMarkAllNotificationsReadMutation,
  useSetNotificationReadStateMutation,
} from "./use-notification-mutations";

vi.mock("../../services/notifications.service", () => ({
  markAllNotificationsRead: vi.fn(),
  setNotificationReadState: vi.fn(),
  updateNotificationPreferences: vi.fn(),
}));

const mockedMarkAll = vi.mocked(markAllNotificationsRead);
const mockedSetReadState = vi.mocked(setNotificationReadState);

const unreadNotification: NotificationPresentationDto = {
  notificationId: "11111111-1111-4111-8111-111111111111",
  type: "application_status",
  templateKey: "application.accepted",
  templateVersion: 1,
  title: "Application accepted",
  body: "Your application was accepted.",
  deepLink: "/applications/11111111-1111-4111-8111-111111111111",
  priority: "attention",
  isRead: false,
  readAt: null,
  createdAt: "2026-08-09T00:00:00.000Z",
  aggregateVersion: 1,
};

const readNotification: NotificationPresentationDto = {
  ...unreadNotification,
  notificationId: "22222222-2222-4222-8222-222222222222",
  isRead: true,
  readAt: "2026-08-09T00:01:00.000Z",
};

type MutationApi = {
  read: ReturnType<typeof useSetNotificationReadStateMutation>;
  markAll: ReturnType<typeof useMarkAllNotificationsReadMutation>;
};

function MutationHarness({ onReady }: { onReady: (api: MutationApi) => void }) {
  const read = useSetNotificationReadStateMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  onReady({ read, markAll });
  return null;
}

function createPageData(): { pages: NotificationPageDto[]; pageParams: unknown[] } {
  return {
    pages: [
      { items: [unreadNotification], nextCursor: "cursor-2" },
      { items: [readNotification], nextCursor: null },
    ],
    pageParams: [undefined, "cursor-2"],
  };
}

describe("notification read mutations", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  let api: MutationApi;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(
      notificationKeys.list(normalizeNotificationFilters()),
      createPageData(),
    );
    queryClient.setQueryData(notificationKeys.unreadCount(), {
      unreadCount: 1,
    });
    vi.mocked(setNotificationReadState).mockReset();
    vi.mocked(markAllNotificationsRead).mockReset();
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <MutationHarness onReady={(value) => (api = value)} />
        </QueryClientProvider>,
      );
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("optimistically updates one item and the unread count, then reconciles with the response", async () => {
    const serverResponse = {
      ...unreadNotification,
      isRead: true,
      readAt: "2026-08-09T00:02:00.000Z",
      aggregateVersion: 2,
    };
    let resolveRequest!: (value: NotificationPresentationDto) => void;
    mockedSetReadState.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    let mutationPromise!: ReturnType<typeof api.read.mutateAsync>;
    await act(async () => {
      mutationPromise = api.read.mutateAsync({
        notificationId: unreadNotification.notificationId,
        state: "read",
      });
      await Promise.resolve();
    });

    const data = queryClient.getQueryData<{
      pages: NotificationPageDto[];
      pageParams: unknown[];
    }>(notificationKeys.list(normalizeNotificationFilters()));
    expect(data?.pages[0]?.items[0]).toMatchObject({
      isRead: true,
      readAt: expect.any(String),
    });
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      unreadCount: 0,
    });

    await act(async () => {
      resolveRequest(serverResponse);
      await mutationPromise;
    });

    const reconciledData = queryClient.getQueryData<{
      pages: NotificationPageDto[];
      pageParams: unknown[];
    }>(notificationKeys.list(normalizeNotificationFilters()));
    expect(reconciledData?.pages[0]?.items[0]).toEqual(serverResponse);
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      unreadCount: 0,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.lists(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.unreadCount(),
    });
  });

  it("updates the ordinary latest-notifications cache used by the popover", async () => {
    const serverResponse = {
      ...unreadNotification,
      isRead: true,
      readAt: "2026-08-09T00:04:00.000Z",
      aggregateVersion: 2,
    };
    queryClient.setQueryData(
      notificationKeys.list(
        normalizeNotificationFilters({ limit: 5 }),
      ),
      { items: [unreadNotification], nextCursor: null },
    );
    mockedSetReadState.mockResolvedValueOnce(serverResponse);

    await act(async () => {
      await api.read.mutateAsync({
        notificationId: unreadNotification.notificationId,
        state: "read",
      });
    });

    expect(mockedSetReadState).toHaveBeenCalledWith(
      unreadNotification.notificationId,
      "read",
    );
    expect(
      queryClient.getQueryData<NotificationPageDto>(
        notificationKeys.list(normalizeNotificationFilters({ limit: 5 })),
      )?.items[0],
    ).toEqual(serverResponse);
  });

  it("marks the ordinary latest-notifications cache read with mark-all", async () => {
    queryClient.setQueryData(
      notificationKeys.list(
        normalizeNotificationFilters({ limit: 5 }),
      ),
      { items: [unreadNotification], nextCursor: null },
    );
    mockedMarkAll.mockResolvedValueOnce({
      updatedCount: 1,
      snapshotAt: "2026-08-09T00:05:00.000Z",
    });

    await act(async () => {
      await api.markAll.mutateAsync();
    });

    expect(
      queryClient.getQueryData<NotificationPageDto>(
        notificationKeys.list(normalizeNotificationFilters({ limit: 5 })),
      )?.items[0],
    ).toMatchObject({ isRead: true, readAt: expect.any(String) });
  });

  it("rolls back a stale read command and still schedules final reconciliation", async () => {
    const error = Object.assign(new Error("Notification is stale"), {
      code: "NOTIFICATION_NOT_FOUND",
    });
    mockedSetReadState.mockRejectedValueOnce(error);
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await expect(
      act(async () =>
        api.read.mutateAsync({
          notificationId: unreadNotification.notificationId,
          state: "read",
        }),
      ),
    ).rejects.toEqual(error);

    const data = queryClient.getQueryData<{
      pages: NotificationPageDto[];
      pageParams: unknown[];
    }>(notificationKeys.list(normalizeNotificationFilters()));
    expect(data?.pages[0]?.items[0]).toEqual(unreadNotification);
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      unreadCount: 1,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.lists(),
    });
  });

  it("optimistically marks every cached page read and rolls back mark-all failures", async () => {
    const error = new Error("temporarily unavailable");
    mockedMarkAll.mockRejectedValueOnce(error);

    await expect(act(async () => api.markAll.mutateAsync())).rejects.toEqual(
      error,
    );

    const data = queryClient.getQueryData<{
      pages: NotificationPageDto[];
      pageParams: unknown[];
    }>(notificationKeys.list(normalizeNotificationFilters()));
    expect(data?.pages[0]?.items[0]).toEqual(unreadNotification);
    expect(data?.pages[1]?.items[0]).toEqual(readNotification);
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      unreadCount: 1,
    });
  });

  it("keeps the optimistic mark-all state and reconciles the server response", async () => {
    mockedMarkAll.mockResolvedValueOnce({
      updatedCount: 1,
      snapshotAt: "2026-08-09T00:03:00.000Z",
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await act(async () => {
      await api.markAll.mutateAsync();
    });

    const data = queryClient.getQueryData<{
      pages: NotificationPageDto[];
      pageParams: unknown[];
    }>(notificationKeys.list(normalizeNotificationFilters()));
    expect(data?.pages.flatMap((page) => page.items).every((item) => item.isRead)).toBe(
      true,
    );
    expect(queryClient.getQueryData(notificationKeys.unreadCount())).toEqual({
      unreadCount: 0,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: notificationKeys.lists(),
    });
  });
});
