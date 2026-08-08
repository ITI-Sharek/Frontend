import { Link } from "@tanstack/react-router";
import { Bell, BellRing, WifiOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notifications-provider";

import {
  getNotificationContent,
  getNotificationTypeLabel,
} from "./notification-presenter";

export function NotificationPopover({
  allNotificationsHref = ROUTES.notifications,
}: {
  allNotificationsHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    latestNotifications,
    unreadCount,
    connectionStatus,
    markAllNotificationsRead,
    markNotificationRead,
  } = useNotifications();
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
          dir="rtl"
          className="absolute end-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] origin-top-end overflow-hidden rounded-card border border-border bg-card text-right shadow-md"
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
                onClick={markAllNotificationsRead}
                className="min-h-9 rounded-input px-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overscroll-contain overflow-y-auto p-2">
            {latestNotifications.length === 0 ? (
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
                {latestNotifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.notificationId}
                    notification={notification}
                    onRead={() => markNotificationRead(notification.notificationId)}
                  />
                ))}
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

function NotificationItem({
  notification,
  onRead,
}: {
  notification: ReturnType<typeof useNotifications>["latestNotifications"][number];
  onRead: () => void;
}) {
  const content = getNotificationContent(notification);

  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        "w-full rounded-input p-3 text-right transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        notification.isRead ? "hover:bg-border/25" : "bg-primary/10 hover:bg-primary/15",
      )}
    >
      <span className="text-[11px] text-muted-foreground">
        {getNotificationTypeLabel(notification.type)}
      </span>
      <span className="mt-1 block truncate text-sm font-semibold text-foreground">
        {content.title}
      </span>
      <span className="mt-1 line-clamp-2 block break-words text-xs leading-5 text-muted-foreground">
        {content.message}
      </span>
    </button>
  );
}

function getConnectionCopy(
  status: ReturnType<typeof useNotifications>["connectionStatus"],
): string {
  if (status === "connected") return "متصل مباشرة";
  if (status === "connecting") return "جارٍ الاتصال…";
  if (status === "unauthorized") return "الجلسة لا تسمح بالإشعارات";
  return "سيتم التحديث عند استعادة الاتصال";
}
