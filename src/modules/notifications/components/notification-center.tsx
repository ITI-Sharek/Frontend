import { Bell, Check, CheckCheck, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notifications-provider";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

import {
  formatNotificationDate,
  getNotificationContent,
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
    <div dir="rtl">
      <PageContainer>
      <PageHeader
        title="الإشعارات"
        description="تابع تغييرات الحساب ونتائج المراجعات والأحداث التي تحتاج إلى انتباهك."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ConnectionStatus status={connectionStatus} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              تحديد الكل كمقروء
            </Button>
          </div>
        }
      />

      {latestNotifications.length === 0 ? (
        <PageFeedback
          className="mt-6"
          icon={connectionStatus === "connected" ? Bell : WifiOff}
          title="لا توجد إشعارات بعد"
          description={
            connectionStatus === "connected"
              ? "ستظهر نتائج المراجعات والأحداث المهمة هنا فور وصولها."
              : "ستظهر الأحداث الجديدة هنا بعد استعادة الاتصال بالخادم."
          }
        />
      ) : (
        <ol className="mt-6 overflow-hidden rounded-card border border-border bg-card">
          {latestNotifications.map((notification) => {
            const content = getNotificationContent(notification);
            return (
              <li
                key={notification.notificationId}
                className="border-b border-border last:border-b-0"
              >
                <article
                  className={cn(
                    "relative flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5",
                    !notification.isRead && "bg-primary/5",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!notification.isRead && (
                        <span
                          className="size-2 rounded-full bg-primary"
                          aria-label="غير مقروء"
                        />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      <span aria-hidden="true" className="text-border">
                        ·
                      </span>
                      <time
                        dateTime={notification.createdAt}
                        className="font-mono text-[11px] text-muted-foreground"
                      >
                        {formatNotificationDate(notification.createdAt)}
                      </time>
                    </div>
                    <h2 className="mt-2 break-words text-base font-bold text-foreground">
                      {content.title}
                    </h2>
                    <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
                      {content.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() =>
                        markNotificationRead(notification.notificationId)
                      }
                      className="inline-flex min-h-10 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-input px-3 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      تحديد كمقروء
                    </button>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
      </PageContainer>
    </div>
  );
}

function ConnectionStatus({
  status,
}: {
  status: ReturnType<typeof useNotifications>["connectionStatus"];
}) {
  const isConnected = status === "connected";

  return (
    <span
      role="status"
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          isConnected ? "bg-emerald-500" : "bg-amber-500",
        )}
      />
      {getStatusCopy(status)}
    </span>
  );
}

function getStatusCopy(
  status: ReturnType<typeof useNotifications>["connectionStatus"],
): string {
  if (status === "connected") return "متصل مباشرة";
  if (status === "connecting") return "جارٍ الاتصال…";
  if (status === "unauthorized") return "الجلسة غير مخولة";
  return "غير متصل";
}
