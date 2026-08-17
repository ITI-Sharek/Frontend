import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
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
import { SiteHeader } from "@/shared/components/layout/site-header";
import { getAdminNavigation } from "@/shared/components/layout/workspace-navigation";
import { SharekLoader } from "@/shared/components/feedback";

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
  const headerNavItems = navigation
    .filter((item) => !item.secondary && !item.disabled)
    .slice(0, 4)
    .map((item) => ({
      label: item.label,
      href: item.to,
      active: item.active,
    }));

  return (
    <AppShell
      nav={navigation}
      brand={{
        title: t("adminLayout.brandTitle"),
        subtitle: t("workspace.adminBrandSubtitle"),
        icon: ShieldCheck,
      }}
      navigationLabel={t("adminLayout.navigationLabel")}
      topBar={
        <SiteHeader
          navItems={headerNavItems}
          navLabel={t("adminLayout.navigationLabel")}
          skipToContentLabel={t("navigation.skipToContent")}
          showSkipLink={false}
          brand={{
            title: t("adminLayout.brandTitle"),
            subtitle: "Review operations",
          }}
          user={{
            displayName,
            avatarUrl: currentUser.avatarUrl,
            profileSubtitle: t("navigation.adminPanel"),
            online: true,
            menuItems: [
              { label: t("navigation.adminOverview"), to: ROUTES.admin },
            ],
          }}
          onLogout={() => {
            logoutMutation.mutate(undefined, {
              onSettled: () => {
                void navigate({ to: ROUTES.login });
              },
            });
          }}
          utilityActions={
            <NotificationPopover
              allNotificationsHref={ROUTES.adminNotifications}
            />
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
      <SharekLoader
        size="md"
        showLabel
        label={t("common.loading_admin_session", "جارٍ تحميل جلسة المسؤول...")}
      />
    </div>
  );
}
