import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import {
  requireAdminRoute,
  useCurrentUserQuery,
  useLogoutMutation,
} from "@/modules/auth";
import {
  NotificationPopover,
  useUnreadNotificationCountQuery,
} from "@/modules/notifications";
import { useAdminPendingSkillReviewsQuery } from "@/modules/skill-profiles";
import { storageService } from "@/services/storage.service";
import { AppShell } from "@/shared/components/layout/app-shell";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { getAdminNavigation } from "@/shared/components/layout/workspace-navigation";
import { WorkspaceTopBar } from "@/shared/components/layout/workspace-top-bar";
import { Button } from "@/shared/components/ui/button";

export const beforeLoadAdminRoute = requireAdminRoute;

export const Route = createFileRoute("/_adminLayout")({
  beforeLoad: beforeLoadAdminRoute,
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useTranslation();
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const logoutMutation = useLogoutMutation();
  const pendingReviews = useAdminPendingSkillReviewsQuery({ page: 1, limit: 1 });
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;

  useEffect(() => {
    if (!currentUser && !storageService.getAccessToken()) {
      window.location.replace(ROUTES.login);
      return;
    }

    if (currentUser && currentUser.role !== "admin") {
      window.location.replace(getPostLoginPath(currentUser));
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== "admin") {
    return <AdminSessionLoadingState />;
  }

  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;
  const navigation = getAdminNavigation({
    pathname,
    unreadCount,
    pendingReviewsCount: pendingReviews.data?.total ?? 0,
    t,
  });

  return (
    <AppShell
      nav={navigation}
      brand={{
        title: t("adminLayout.brandTitle"),
        subtitle: "Review operations",
        icon: ShieldCheck,
      }}
      navigationLabel={t("adminLayout.navigationLabel")}
      topBar={
        <WorkspaceTopBar
          title={t("adminLayout.workspaceTitle")}
          description={t("adminLayout.workspaceDescription")}
          actions={
            <>
              <NotificationPopover
                allNotificationsHref={ROUTES.adminNotifications}
              />
              <span className="hidden max-w-44 truncate rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground sm:inline-flex">
                {displayName}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("auth.logout")}
                disabled={logoutMutation.isPending}
                onClick={() => {
                  logoutMutation.mutate(undefined, {
                    onSettled: () => {
                      void navigate({ to: ROUTES.login });
                    },
                  });
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </>
          }
        />
      }
    >
      <PageTransition routeKey={pathname}>
        <Outlet />
      </PageTransition>
    </AppShell>
  );
}

function AdminSessionLoadingState() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground"
    >
      {t("common.loading_admin_session")}
    </div>
  );
}
