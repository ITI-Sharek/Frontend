import { Link } from "@tanstack/react-router";
import { Bell, BellRing, WifiOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notifications-provider";

import {
  useLatestNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../api/queries/use-notification-queries";
import {
  useMarkAllNotificationsReadMutation,
  useSetNotificationReadStateMutation,
} from "../api/mutations/use-notification-mutations";
import { getSafeNotificationLink } from "../utils/safe-notification-link";
import {
  getNotificationPriorityLabel,
  getNotificationTypeLabel,
} from "./notification-presenter";

const POPOVER_GUTTER_PX = 8;
const POPOVER_OFFSET_PX = 8;
const POPOVER_MAX_WIDTH_PX = 352;

interface PopoverPosition {
  left: number;
  top: number;
}

export function NotificationPopover({
  allNotificationsHref = ROUTES.notifications,
}: {
  allNotificationsHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] =
    useState<PopoverPosition | null>(null);
  const popoverId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { connectionStatus } = useNotifications();
  const latestQuery = useLatestNotificationsQuery();
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const setReadStateMutation = useSetNotificationReadStateMutation();
  const latestNotifications = latestQuery.data?.items ?? [];
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const Icon = unreadCount > 0 ? BellRing : Bell;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPopoverPosition(null);
      return;
    }

    function updatePopoverPosition() {
      const trigger = containerRef.current?.getBoundingClientRect();
      const popover = popoverRef.current;
      if (!trigger || !popover) return;

      const viewportWidth = window.innerWidth;
      const measuredWidth = popover.getBoundingClientRect().width;
      const width = Math.min(
        measuredWidth || POPOVER_MAX_WIDTH_PX,
        Math.max(0, viewportWidth - POPOVER_GUTTER_PX * 2),
      );
      const minLeft = POPOVER_GUTTER_PX;
      const maxLeft = Math.max(
        minLeft,
        viewportWidth - width - POPOVER_GUTTER_PX,
      );
      const preferredLeft =
        document.documentElement.dir === "rtl"
          ? trigger.right - width
          : trigger.left;

      setPopoverPosition({
        left: Math.min(Math.max(preferredLeft, minLeft), maxLeft),
        top: trigger.bottom + POPOVER_OFFSET_PX,
      });
    }

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [open]);

  const safeOrigin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={
          unreadCount > 0 ? `الإشعارات، ${unreadCount} غير مقروءة` : "الإشعارات"
        }
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-10 touch-manipulation items-center justify-center rounded-input border border-border bg-card text-muted-foreground transition-colors duration-150 hover:bg-border/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Icon className="size-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -start-1 -top-1 min-w-5 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="آخر الإشعارات"
          ref={popoverRef}
          style={
            popoverPosition
              ? {
                  left: `${popoverPosition.left}px`,
                  top: `${popoverPosition.top}px`,
                }
              : { visibility: "hidden" }
          }
          className="fixed z-40 w-[min(22rem,calc(100vw-2rem))] max-h-[calc(100dvh-5rem)] overflow-hidden rounded-card border border-border bg-card text-right shadow-md"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-foreground">الإشعارات</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {getConnectionCopy(connectionStatus)}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
                className="min-h-9 rounded-input px-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overscroll-contain overflow-y-auto p-2">
            {latestQuery.isLoading ? (
              <p role="status" className="px-4 py-8 text-center text-sm text-muted-foreground">
                جارٍ تحميل الإشعارات…
              </p>
            ) : latestQuery.isError ? (
              <div role="alert" className="px-4 py-8 text-center text-sm text-muted-foreground">
                تعذّر تحميل الإشعارات
                <button
                  type="button"
                  onClick={() => void latestQuery.refetch()}
                  className="mt-3 block w-full font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : latestNotifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <WifiOff
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">
                  لا توجد إشعارات في هذه الجلسة بعد.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {latestNotifications.slice(0, 5).map((notification) => {
                  const deepLink = getSafeNotificationLink(
                    notification.deepLink,
                    safeOrigin,
                  );
                  return (
                    <article
                      key={notification.notificationId}
                      className={cn(
                        "rounded-input p-3 text-right transition-colors duration-150",
                        notification.isRead
                          ? "hover:bg-border/25"
                          : "bg-primary/10 hover:bg-primary/15",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{getNotificationTypeLabel(notification.type)}</span>
                        <span>{getNotificationPriorityLabel(notification.priority)}</span>
                      </div>
                      <span className="mt-1 block truncate text-sm font-semibold text-foreground">
                        {notification.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block break-words text-xs leading-5 text-muted-foreground">
                        {notification.body}
                      </span>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {deepLink ? (
                          <a
                            href={deepLink}
                            onClick={() =>
                              setReadStateMutation.mutate({
                                notificationId: notification.notificationId,
                                state: "read",
                              })
                            }
                            className="text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            فتح الإشعار
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            الهدف غير متاح
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={setReadStateMutation.isPending}
                          onClick={() =>
                            setReadStateMutation.mutate({
                              notificationId: notification.notificationId,
                              state: notification.isRead ? "unread" : "read",
                            })
                          }
                          className="text-xs font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {notification.isRead
                            ? "تحديد كغير مقروء"
                            : "تحديد كمقروء"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to={allNotificationsHref}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            عرض كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}

function getConnectionCopy(
  status: ReturnType<typeof useNotifications>["connectionStatus"],
): string {
  if (status === "connected") return "متصل مباشرة";
  if (status === "connecting") return "جارٍ الاتصال…";
  if (status === "synchronizing") return "جارٍ مزامنة الإشعارات…";
  if (status === "unauthorized") return "الجلسة لا تسمح بالإشعارات";
  return "سيتم التحديث عند استعادة الاتصال";
}
