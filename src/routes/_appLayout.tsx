import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import {
  requireMemberRoute,
  useCurrentUserQuery,
  useLogoutMutation,
} from "@/modules/auth";
import { ensureCurrentContributorProfile } from "@/modules/contributors";
import { NotificationPopover } from "@/modules/notifications";
import { useNotifications } from "@/providers/notifications-provider";
import { storageService } from "@/services/storage.service";
import { AppShell } from "@/shared/components/layout/app-shell";
import { getMemberNavigation } from "@/shared/components/layout/workspace-navigation";
import { WorkspaceTopBar } from "@/shared/components/layout/workspace-top-bar";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
import { HeaderSearch } from "@/shared/components/navigation/header-search";
import { MessagesButton } from "@/shared/components/navigation/messages-button";
import { ProfileMenu } from "@/shared/components/navigation/profile-menu";

export const Route = createFileRoute("/_appLayout")({
  beforeLoad: requireMemberRoute,
  component: AppLayout,
});

function AppLayout() {
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
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
    username,
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
    { label: t("navigation.settings"), to: ROUTES.settings },
  ];

  return (
    <AppShell
      nav={navigation}
      topBar={
        <WorkspaceTopBar
          title={
            currentUser.role === "owner"
              ? t("workspace.ownerSpace")
              : t("workspace.memberSpace")
          }
          description={t("workspace.everythingInOnePlace")}
          search={<HeaderSearch />}
          actions={
            <>
              <LanguageSwitcher />
              <MessagesButton />
              <NotificationPopover allNotificationsHref={ROUTES.notifications} />
              <ProfileMenu
                displayName={displayName}
                avatarUrl={currentUser.avatarUrl}
                items={profileItems}
                onLogout={() => {
                  logoutMutation.mutate(undefined, {
                    onSettled: () => {
                      void navigate({ to: ROUTES.login });
                    },
                  });
                }}
              />
            </>
          }
        />
      }
    >
      <Outlet />
    </AppShell>
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
      {t("common.loading_session")}
    </div>
  );
}
