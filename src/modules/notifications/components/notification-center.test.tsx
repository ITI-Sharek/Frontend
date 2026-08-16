// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationCenter } from "./notification-center";

vi.mock("@/providers/notifications-provider", () => ({
  useNotifications: vi.fn(),
}));
vi.mock("../api/queries/use-notification-queries", () => ({
  useNotificationListQuery: vi.fn(),
  useUnreadNotificationCountQuery: vi.fn(),
}));
vi.mock("../api/mutations/use-notification-mutations", () => ({
  useMarkAllNotificationsReadMutation: vi.fn(),
  useSetNotificationReadStateMutation: vi.fn(),
}));

const { useNotifications } = await import("@/providers/notifications-provider");
const { useNotificationListQuery, useUnreadNotificationCountQuery } =
  await import("../api/queries/use-notification-queries");
const {
  useMarkAllNotificationsReadMutation,
  useSetNotificationReadStateMutation,
} = await import("../api/mutations/use-notification-mutations");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const notification = {
  notificationId: "11111111-1111-4111-8111-111111111111",
  type: "application_status" as const,
  templateKey: "application.accepted",
  templateVersion: 1,
  title: "Application accepted",
  body: "Your application was accepted and an Assignment was created.",
  deepLink: "/applications/11111111-1111-4111-8111-111111111111",
  priority: "attention" as const,
  isRead: false,
  readAt: null,
  createdAt: "2026-08-09T00:00:00.000Z",
  aggregateVersion: 1,
};

function listQuery(overrides: Record<string, unknown> = {}) {
  return {
    data: { pages: [{ items: [notification], nextCursor: null }] },
    isLoading: false,
    isError: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
    ...overrides,
  };
}

describe("NotificationCenter", () => {
  let container: HTMLDivElement;
  let root: Root;
  let markAll: ReturnType<typeof vi.fn>;
  let setReadState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    markAll = vi.fn();
    setReadState = vi.fn();
    vi.mocked(useNotifications).mockReturnValue({
      connectionStatus: "delayed",
    });
    vi.mocked(useNotificationListQuery).mockReturnValue(listQuery() as never);
    vi.mocked(useUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 1 },
    } as never);
    vi.mocked(useMarkAllNotificationsReadMutation).mockReturnValue({
      mutate: markAll,
      isPending: false,
    } as never);
    vi.mocked(useSetNotificationReadStateMutation).mockReturnValue({
      mutate: setReadState,
      isPending: false,
    } as never);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.clearAllMocks();
  });

  async function render() {
    await act(async () => {
      root.render(<NotificationCenter />);
    });
  }

  it("renders HTTP-loaded items even when the realtime socket is disconnected", async () => {
    await render();

    expect(container.textContent).toContain(notification.title);
    expect(container.textContent).toContain("غير متصل");
  });

  it("shows loading, empty, and recoverable error states", async () => {
    vi.mocked(useNotificationListQuery).mockReturnValue(
      listQuery({ isLoading: true, data: undefined }) as never,
    );
    await render();
    expect(container.querySelector('[role="status"]')).not.toBeNull();

    vi.mocked(useNotificationListQuery).mockReturnValue(
      listQuery({
        data: { pages: [{ items: [], nextCursor: null }] },
      }) as never,
    );
    await render();
    expect(container.textContent).toContain("لا توجد إشعارات بعد");

    const refetch = vi.fn();
    vi.mocked(useNotificationListQuery).mockReturnValue(
      listQuery({ isError: true, data: undefined, refetch }) as never,
    );
    await render();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "تعذّر تحميل الإشعارات",
    );
  });

  it("offers filters, load-more, and explicit read commands", async () => {
    const fetchNextPage = vi.fn();
    vi.mocked(useNotificationListQuery).mockReturnValue(
      listQuery({
        hasNextPage: true,
        fetchNextPage,
      }) as never,
    );
    await render();

    const readStateTabs = container.querySelector(
      '[role="tablist"][aria-label="حالة قراءة الإشعارات"]',
    );
    if (!readStateTabs) throw new Error("Expected read-state tabs");
    expect(readStateTabs.querySelectorAll('[role="tab"]')).toHaveLength(3);
    expect(
      readStateTabs.querySelector('[role="tab"][data-state="active"]')
        ?.textContent,
    ).toContain("الكل");
    expect(
      container.querySelector('select[name="notification-type"]'),
    ).not.toBeNull();

    const unreadTab = readStateTabs.querySelector<HTMLButtonElement>(
      '[role="tab"][data-read-state="unread"]',
    );
    if (!unreadTab) throw new Error("Expected unread tab");
    await act(async () => {
      unreadTab.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, button: 0 }),
      );
    });
    expect(useNotificationListQuery).toHaveBeenLastCalledWith({
      readState: "unread",
    });

    const loadMore = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تحميل المزيد"),
    );
    if (!loadMore) throw new Error("Expected load-more button");
    await act(async () => loadMore.click());
    expect(fetchNextPage).toHaveBeenCalledTimes(1);

    const markRead = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تحديد كمقروء"),
    );
    if (!markRead) throw new Error("Expected mark-read button");
    await act(async () => markRead.click());
    expect(setReadState).toHaveBeenCalledWith({
      notificationId: notification.notificationId,
      state: "read",
    });

    const markAllButton = [...container.querySelectorAll("button")].find(
      (button) => button.textContent.includes("تحديد الكل كمقروء"),
    );
    if (!markAllButton) throw new Error("Expected mark-all button");
    await act(async () => markAllButton.click());
    expect(markAll).toHaveBeenCalledTimes(1);
  });
});
