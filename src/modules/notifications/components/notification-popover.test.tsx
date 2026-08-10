// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationPopover } from "./notification-popover";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    className,
    onClick,
    to,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    to: string;
  }) => (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("@/providers/notifications-provider", () => ({
  useNotifications: vi.fn(),
}));
vi.mock("../api/queries/use-notification-queries", () => ({
  useLatestNotificationsQuery: vi.fn(),
  useUnreadNotificationCountQuery: vi.fn(),
}));
vi.mock("../api/mutations/use-notification-mutations", () => ({
  useMarkAllNotificationsReadMutation: vi.fn(),
  useSetNotificationReadStateMutation: vi.fn(),
}));

const { useNotifications } = await import(
  "@/providers/notifications-provider"
);
const {
  useLatestNotificationsQuery,
  useUnreadNotificationCountQuery,
} = await import("../api/queries/use-notification-queries");
const {
  useMarkAllNotificationsReadMutation,
  useSetNotificationReadStateMutation,
} = await import("../api/mutations/use-notification-mutations");

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
  createdAt: "2026-08-08T09:00:00.000Z",
  aggregateVersion: 1,
};

describe("NotificationPopover", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.documentElement.setAttribute("dir", "rtl");
    document.body.append(container);
    root = createRoot(container);
    vi.mocked(useNotifications).mockReturnValue({
      connectionStatus: "connected",
    });
    vi.mocked(useLatestNotificationsQuery).mockReturnValue({
      data: { items: [notification], nextCursor: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 1 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useMarkAllNotificationsReadMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useSetNotificationReadStateMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("anchors the RTL popover to the bell while clamping viewport overflow", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.matches('[role="dialog"]')) {
          return {
            bottom: 0,
            height: 400,
            left: 0,
            right: 352,
            top: 0,
            width: 352,
          } as DOMRect;
        }

        if (this.classList.contains("relative")) {
          return {
            bottom: 64,
            height: 40,
            left: 204,
            right: 244,
            top: 24,
            width: 40,
          } as DOMRect;
        }

        return {
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
        } as DOMRect;
      });

    await act(async () => {
      root.render(<NotificationPopover />);
    });

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label^="الإشعارات"]')
        ?.click();
    });

    const popover = container.querySelector('[role="dialog"]');
    expect(popover).toMatchObject({
      style: expect.objectContaining({ left: "8px", top: "72px" }),
    });

    getBoundingClientRect.mockRestore();
  });

  it("uses the unread-count query for the badge even when the latest page is empty", async () => {
    vi.mocked(useLatestNotificationsQuery).mockReturnValue({
      data: { items: [], nextCursor: null },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUnreadNotificationCountQuery).mockReturnValue({
      data: { unreadCount: 7 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    await act(async () => root.render(<NotificationPopover />));
    expect(container.querySelector('button[aria-label*="7"]')).not.toBeNull();

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label^="الإشعارات"]')
        ?.click();
    });
    expect(container.textContent).toContain("لا توجد إشعارات");
  });

  it("does not mark an item read when the popover is merely opened", async () => {
    const markRead = vi.fn();
    vi.mocked(useSetNotificationReadStateMutation).mockReturnValue({
      mutate: markRead,
      isPending: false,
    } as never);

    await act(async () => root.render(<NotificationPopover />));
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('button[aria-label^="الإشعارات"]')
        ?.click();
    });

    expect(markRead).not.toHaveBeenCalled();
  });

  it("marks an item read only when its safe deep link is intentionally opened", async () => {
    const markRead = vi.fn();
    vi.mocked(useSetNotificationReadStateMutation).mockReturnValue({
      mutate: markRead,
      isPending: false,
    } as never);

    await act(async () => root.render(<NotificationPopover />));
    await act(async () => {
      const trigger = container.querySelector<HTMLButtonElement>(
        'button[aria-label^="الإشعارات"]',
      );
      if (!trigger) throw new Error("Expected notification trigger");
      trigger.click();
    });

    const openLink = [...container.querySelectorAll("a")].find((link) =>
      link.textContent.includes("فتح الإشعار"),
    );
    if (!openLink) throw new Error("Expected notification deep link");
    await act(async () => openLink.click());

    expect(markRead).toHaveBeenCalledWith({
      notificationId: notification.notificationId,
      state: "read",
    });
  });

  it("renders unsafe deep links as unavailable actions", async () => {
    vi.mocked(useLatestNotificationsQuery).mockReturnValue({
      data: {
        items: [{ ...notification, deepLink: "javascript:alert(1)" }],
        nextCursor: null,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as never);

    await act(async () => root.render(<NotificationPopover />));
    await act(async () => {
      const trigger = container.querySelector<HTMLButtonElement>(
        'button[aria-label^="الإشعارات"]',
      );
      if (!trigger) throw new Error("Expected notification trigger");
      trigger.click();
    });

    expect(container.textContent).toContain("الهدف غير متاح");
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
});
