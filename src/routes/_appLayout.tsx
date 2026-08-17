import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import {
  requireMemberRoute,
  useCurrentUserQuery,
  useLogoutMutation,
} from "@/modules/auth";
import { ensureCurrentContributorProfile } from "@/modules/contributors";
import { MessagesButton } from "@/modules/assignment-conversations";
import {
  NotificationPopover,
  useUnreadNotificationCountQuery,
} from "@/modules/notifications";
import { storageService } from "@/services/storage.service";
import { WorkspaceShell } from "@/shared/components/layout/workspace-shell";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { SiteHeader } from "@/shared/components/layout/site-header";
import { getMemberNavigation } from "@/shared/components/layout/workspace-navigation";
import { SharekMarkLoader } from "@/shared/components/feedback";

export const Route = createFileRoute("/_appLayout")({
  beforeLoad: requireMemberRoute,
  component: AppLayout,
});

function AppLayout() {
  const { t } = useTranslation();
  const unreadCountQuery = useUnreadNotificationCountQuery();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const conversationUnreadCountQuery = useUnreadNotificationCountQuery(
    "conversation_activity",
  );
  const conversationUnreadCount =
    conversationUnreadCountQuery.data?.unreadCount ?? 0;
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const routeContext = Route.useRouteContext();
  const currentUserQuery = useCurrentUserQuery(routeContext.currentUser);
  const logoutMutation = useLogoutMutation();
  const currentUser = routeContext.currentUser ?? currentUserQuery.data;
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(
    currentUser?.username ?? null,
  );

  useEffect(() => {
    if (currentUser?.username) {
      storageService.setUsername(currentUser.username);
      setResolvedUsername(currentUser.username);
      return;
    }

    const storedUsername = storageService.getUsername();
    if (storedUsername) {
      setResolvedUsername(storedUsername);
      return;
    }

    if (currentUser?.role !== "contributor") return;

    let isActive = true;
    ensureCurrentContributorProfile()
      .then((profile) => {
        if (!isActive) return;
        storageService.setUsername(profile.username);
        setResolvedUsername(profile.username);
      })
      .catch(() => {
        // The profile route stays disabled until the next successful refresh.
      });

    return () => {
      isActive = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && !storageService.getAccessToken()) {
      window.location.replace(ROUTES.login);
      return;
    }

    if (currentUser?.role === "admin") {
      window.location.replace(getPostLoginPath(currentUser));
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role === "admin") {
    return <SessionLoadingState />;
  }

  const username = currentUser.username ?? resolvedUsername;
  const navigation = getMemberNavigation({
    role: currentUser.role,
    pathname,
    unreadCount,
    t,
  });
  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;
  const profileItems = [
    ...(currentUser.role === "contributor" && username
      ? [{ label: t("profile.viewProfile"), to: ROUTES.contributorProfile(username) }]
      : []),
    ...(currentUser.role === "contributor"
      ? [
          { label: t("navigation.skillAnalysis"), to: ROUTES.githubSkillAnalysis },
          { label: t("navigation.discussions"), to: ROUTES.discussions },
        ]
      : []),
    { label: t("navigation.settings"), to: ROUTES.settings },
    { label: t("navigation.support"), to: ROUTES.support },
  ];
  return (
    <WorkspaceShell
      nav={navigation}
      navigationLabel={t("navigation.mainNavigation")}
      ribbonEnd={
        currentUser.role === "owner" ? (
          <Link
            to={ROUTES.newProject}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground shadow-[var(--shadow-primary)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("myProjects.importProject")}</span>
          </Link>
        ) : null
      }
      topBar={
        <SiteHeader
          navItems={[]}
          navLabel={t("navigation.mainNavigation")}
          skipToContentLabel={t("navigation.skipToContent")}
          showSkipLink={false}
          user={{
            displayName,
            avatarUrl: currentUser.avatarUrl,
            profileSubtitle:
              currentUser.role === "owner"
                ? t("auth.role.owner")
                : t("auth.role.contributor"),
            online: true,
            menuItems: profileItems,
          }}
          onLogout={() => {
            logoutMutation.mutate(undefined, {
              onSettled: () => {
                void navigate({ to: ROUTES.login });
              },
            });
          }}
          utilityActions={
            <>
              <MessagesButton unreadCount={conversationUnreadCount} />
              <NotificationPopover allNotificationsHref={ROUTES.notifications} />
            </>
          }
        />
      }
    >
      <PageTransition routeKey={pathname}>
        <Outlet />
      </PageTransition>
    </WorkspaceShell>
  );
}

function SessionLoadingState() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground"
    >
      <div className="flex flex-col items-center gap-3">
        <SharekMarkLoader size={72} className="text-foreground" />
        <p>{t("common.loading_session", "جارٍ تحميل الجلسة...")}</p>
      </div>
    </div>
  );
}
