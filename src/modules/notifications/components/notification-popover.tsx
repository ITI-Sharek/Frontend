import { Bell, BellRing, WifiOff } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notifications-provider";

import { getNotificationTypeLabel } from "./notification-presenter";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const {
    latestNotifications,
    unreadCount,
    connectionStatus,
    markAllNotificationsRead,
    markNotificationRead,
  } = useNotifications();
  const Icon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="الإشعارات"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-10 items-center justify-center rounded-input border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-20 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-border bg-card p-3 text-right shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="text-sm font-bold text-foreground">الإشعارات</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getConnectionCopy(connectionStatus)}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-primary"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {latestNotifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <WifiOff className="size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  لا توجد إشعارات في هذه الجلسة بعد.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {latestNotifications.slice(0, 5).map((notification) => (
                  <button
                    key={notification.notificationId}
                    type="button"
                    onClick={() => markNotificationRead(notification.notificationId)}
                    className={cn(
                      "rounded-input border p-3 text-right transition-colors",
                      notification.isRead
                        ? "border-border bg-background"
                        : "border-primary/30 bg-primary/10",
                    )}
                  >
                    <span className="font-mono text-[11px] tracking-[0.65px] text-muted-foreground">
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-foreground">
                      {notification.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                      {notification.message}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href={ROUTES.notifications}
            className="block border-t border-border pt-3 text-center text-sm font-semibold text-primary"
          >
            عرض كل الإشعارات
          </a>
        </div>
      )}
    </div>
  );
}

function getConnectionCopy(
  status: ReturnType<typeof useNotifications>["connectionStatus"],
): string {
  if (status === "connected") return "متصلة الآن";
  if (status === "connecting") return "جارٍ الاتصال";
  if (status === "unauthorized") return "الجلسة لا تسمح بالإشعارات";
  return "سيتم التحديث عند الاتصال";
}
