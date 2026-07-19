import { Bell, CheckCheck, WifiOff } from "lucide-react";

import { useNotifications } from "@/providers/notifications-provider";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import {
  formatNotificationDate,
  getNotificationTypeLabel,
} from "./notification-presenter";

export function NotificationCenter() {
  const {
    latestNotifications,
    unreadCount,
    connectionStatus,
    markAllNotificationsRead,
    markNotificationRead,
  } = useNotifications();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            مركز الإشعارات
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            آخر ما تغيّر في حسابك
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border bg-card px-3 py-2 font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
            {getStatusCopy(connectionStatus)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="size-4" />
            تحديد الكل كمقروء
          </Button>
        </div>
      </header>

      {latestNotifications.length === 0 ? (
        <Card className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
          {connectionStatus === "connected" ? (
            <Bell className="size-8 text-muted-foreground" />
          ) : (
            <WifiOff className="size-8 text-muted-foreground" />
          )}
          <h2 className="text-lg font-bold text-foreground">لا توجد إشعارات بعد</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            ستظهر إشعارات مراجعة المهارات والأحداث المهمة هنا فور وصولها من
            الخادم.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {latestNotifications.map((notification) => (
            <button
              key={notification.notificationId}
              type="button"
              onClick={() => markNotificationRead(notification.notificationId)}
              className="rounded-card border border-border bg-card p-5 text-right transition-colors hover:border-primary/50"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
                    {getNotificationTypeLabel(notification.type)}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-foreground">
                    {notification.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!notification.isRead && (
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                      جديد
                    </span>
                  )}
                  <span className="font-mono text-[12px] tracking-[0.65px] text-muted-foreground">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusCopy(
  status: ReturnType<typeof useNotifications>["connectionStatus"],
): string {
  if (status === "connected") return "متصل realtime";
  if (status === "connecting") return "جارٍ الاتصال";
  if (status === "unauthorized") return "الجلسة مرفوضة";
  return "غير متصل";
}
