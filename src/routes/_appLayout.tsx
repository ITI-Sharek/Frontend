import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
import {
  getMemberNavigation,
  getMemberPlanChip,
} from "@/shared/components/layout/workspace-navigation";
import { WorkspaceTopBar } from "@/shared/components/layout/workspace-top-bar";
import { ProfileMenu } from "@/shared/components/navigation/profile-menu";

export const Route = createFileRoute("/_appLayout")({
  beforeLoad: requireMemberRoute,
  component: AppLayout,
});

function AppLayout() {
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
  });
  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;
  const profileItems = [
    ...(currentUser.role === "contributor" && username
      ? [{ label: "عرض الملف الشخصي", to: ROUTES.contributorProfile(username) }]
      : []),
    { label: "الإعدادات", to: ROUTES.settings },
  ];

  return (
    <AppShell
      nav={navigation}
      planChip={getMemberPlanChip(currentUser.role)}
      topBar={
        <WorkspaceTopBar
          title={currentUser.role === "owner" ? "مساحة المشاريع" : "مساحة المساهم"}
          description="كل ما يحتاج إلى انتباهك في مكان واحد"
          actions={
            <>
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
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground"
    >
      جارٍ التحقق من صلاحية الجلسة…
    </div>
  );
}
