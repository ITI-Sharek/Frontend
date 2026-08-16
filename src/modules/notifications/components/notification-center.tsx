import { Bell, Check, CheckCheck, WifiOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useNotifications } from "@/providers/notifications-provider";
import {
  useNotificationListQuery,
  useUnreadNotificationCountQuery,
} from "../api/queries/use-notification-queries";
import {
  useMarkAllNotificationsReadMutation,
  useSetNotificationReadStateMutation,
} from "../api/mutations/use-notification-mutations";
import type {
  NotificationPresentationDto,
  NotificationType,
} from "../types/notification.types";
import { NOTIFICATION_TYPES } from "../types/notification.types";
import { getSafeNotificationLink } from "../utils/safe-notification-link";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import {
  formatNotificationDate,
  getNotificationContent,
  getNotificationPriorityLabel,
  getNotificationTypeLabel,
} from "./notification-presenter";

type ReadStateFilter = "all" | "read" | "unread";

export function NotificationCenter() {
  const { t } = useTranslation();
  const [readState, setReadState] = useState<ReadStateFilter>("all");
  const [type, setType] = useState<NotificationType | "all">("all");
  const { connectionStatus } = useNotifications();
  const listQuery = useNotificationListQuery({
    ...(readState === "all" ? {} : { readState }),
    ...(type === "all" ? {} : { type }),
  });
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const markAllMutation = useMarkAllNotificationsReadMutation();
  const setReadStateMutation = useSetNotificationReadStateMutation();

  const notifications = useMemo(() => {
    const seen = new Set<string>();
    return (listQuery.data?.pages.flatMap((page) => page.items) ?? []).filter(
      (notification) => {
        if (seen.has(notification.notificationId)) return false;
        seen.add(notification.notificationId);
        return true;
      },
    );
  }, [listQuery.data]);

  const hasUnread = (unreadCountQuery.data?.unreadCount ?? 0) > 0;

  return (
    <div>
      <PageContainer>
        <PageHeader
          title={t("notifications.center.title")}
          description={t("notifications.center.description")}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <ConnectionStatus status={connectionStatus} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasUnread || markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
              >
                <CheckCheck className="size-4" aria-hidden="true" />
                {t("notifications.markAllRead")}
              </Button>
            </div>
          }
        />

      <Tabs
        value={readState}
        onValueChange={(value) => {
          if (value === "all" || value === "read" || value === "unread") {
            setReadState(value);
          }
        }}
        className="mt-6 gap-0"
      >
        <div
          aria-label={t("notifications.center.filters")}
          className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-end sm:justify-between"
        >
        <TabsList
          variant="line"
          aria-label={t("notifications.center.readState")}
          className="flex gap-1 overflow-x-auto"
        >
          {(
            [
              { id: "all", label: t("notifications.center.all") },
              { id: "unread", label: t("notifications.center.unread") },
              { id: "read", label: t("notifications.center.read") },
            ] as const
          ).map((tab) => {
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                data-read-state={tab.id}
                className="min-h-11 shrink-0"
              >
                {tab.label}
                {tab.id === "unread" && hasUnread && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                    {unreadCountQuery.data?.unreadCount ?? 0}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <label className="grid gap-1.5 pb-3 text-xs font-semibold text-foreground">
          {t("notifications.center.type")}
            <NativeSelect
              name="notification-type"
              size="sm"
              value={type}
              onChange={(event) =>
                setType(event.target.value as NotificationType | "all")
              }
              className="bg-card font-normal"
            >
              <NativeSelectOption value="all">
                {t("notifications.center.allTypes")}
              </NativeSelectOption>
              {NOTIFICATION_TYPES.map((notificationType) => (
                <NativeSelectOption key={notificationType} value={notificationType}>
                  {getNotificationTypeLabel(t, notificationType)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
        </label>
        </div>

      <TabsContent value={readState}>

      {listQuery.isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex min-h-64 items-center justify-center rounded-card border border-border bg-card px-6 py-10 text-sm text-muted-foreground"
        >
          {t("notifications.loading")}
        </div>
      ) : listQuery.isError ? (
        <div role="alert" className="mt-6">
          <PageFeedback
            icon={WifiOff}
            title={t("notifications.loadError")}
            description={t("notifications.center.loadErrorDescription")}
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => void listQuery.refetch()}
              >
                {t("common.retry")}
              </Button>
            }
          />
        </div>
      ) : notifications.length === 0 ? (
        <PageFeedback
          className="mt-6"
          icon={connectionStatus === "connected" ? Bell : WifiOff}
          title={t("notifications.emptyTitle")}
          description={
            connectionStatus === "connected"
              ? t("notifications.center.emptyConnected")
              : t("notifications.center.emptyOffline")
          }
        />
      ) : (
        <>
          <ol className="mt-6 max-h-[calc(100dvh-18rem)] overflow-y-auto overscroll-contain rounded-card border border-border bg-card">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.notificationId}
                notification={notification}
                isPending={setReadStateMutation.isPending}
                onSetReadState={(state) =>
                  setReadStateMutation.mutate({
                    notificationId: notification.notificationId,
                    state,
                  })
                }
              />
            ))}
          </ol>

          {listQuery.hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
              >
                {listQuery.isFetchingNextPage
                  ? t("common.loading")
                  : t("notifications.center.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
      </TabsContent>
      </Tabs>
      </PageContainer>
    </div>
  );
}

function NotificationRow({
  notification,
  isPending,
  onSetReadState,
}: {
  notification: NotificationPresentationDto;
  isPending: boolean;
  onSetReadState: (state: "read" | "unread") => void;
}) {
  const { t, i18n } = useTranslation();
  const content = getNotificationContent(t, notification);
  const deepLink = getSafeNotificationLink(
    notification.deepLink,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );

  return (
    <li className="border-b border-border last:border-b-0">
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
                aria-label={t("notifications.unread")}
              />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {getNotificationTypeLabel(t, notification.type)}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              {getNotificationPriorityLabel(t, notification.priority)}
            </span>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <time
              dateTime={notification.createdAt}
              className="font-mono text-[11px] text-muted-foreground"
            >
              {formatNotificationDate(notification.createdAt, i18n.language)}
            </time>
          </div>
          <h2 className="mt-2 break-words text-base font-bold text-foreground">
            {content.title}
          </h2>
          <p className="mt-1 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
            {content.message}
          </p>
          {deepLink ? (
            <a
              href={deepLink}
              onClick={() => onSetReadState("read")}
              className="mt-3 inline-flex min-h-9 items-center rounded-input px-2 text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("notifications.open")}
            </a>
          ) : (
            <span className="mt-3 inline-flex text-xs text-muted-foreground">
              {t("notifications.targetUnavailable")}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onSetReadState(notification.isRead ? "unread" : "read")
          }
          className="inline-flex min-h-10 shrink-0 touch-manipulation items-center justify-center gap-2 self-start rounded-input px-3 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Check className="size-4" aria-hidden="true" />
          {notification.isRead ? t("notifications.markUnread") : t("notifications.markRead")}
        </button>
      </article>
    </li>
  );
}

function ConnectionStatus({
  status,
}: {
  status: ReturnType<typeof useNotifications>["connectionStatus"];
}) {
  const { t } = useTranslation();
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
      {t(`notifications.connection.${status}`)}
    </span>
  );
}
