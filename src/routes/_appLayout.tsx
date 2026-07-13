import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  Compass,
  FileText,
  Github,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { getCurrentUser } from "@/modules/auth";
import { ensureCurrentContributorProfile } from "@/modules/contributors";
import { storageService } from "@/services/storage.service";
import { AppShell } from "@/shared/components/layout/app-shell";
import type { AppShellNavItem } from "@/shared/components/layout/app-shell";

export const Route = createFileRoute("/_appLayout")({
  component: AppLayout,
});

/**
 * Contributor app shell (navigation-model §2). Explore/Tasks/Applications/
 * Skills/Settings routes don't exist yet — they render as inert links until
 * their features land. Plan chip is mock data until a quota endpoint exists.
 */
function AppLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  // Resolved after mount: localStorage is unavailable during SSR and reading
  // it during render would cause a hydration mismatch. Sessions from before
  // the username was persisted at login fall back to GET /auth/me.
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const stored = storageService.getUsername();
    if (stored !== null) {
      setUsername(stored);
      return;
    }
    if (storageService.getAccessToken() === null) return;

    let isActive = true;
    getCurrentUser()
      .then(async (user) => {
        let resolved = user.username;
        if (resolved === null && user.role === "contributor") {
          const profile = await ensureCurrentContributorProfile();
          resolved = profile.username;
        }
        if (resolved !== null && isActive) {
          storageService.setUsername(resolved);
          setUsername(resolved);
        }
      })
      .catch(() => {
        // Not signed in / session expired — the link stays inert.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const nav: AppShellNavItem[] = [
    {
      label: "الملف الشخصي",
      href: username ? ROUTES.contributorProfile(username) : "#",
      icon: UserRound,
      active: pathname.startsWith("/profile/"),
    },
    {
      label: "لوحة التحكم",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
      active: pathname === ROUTES.dashboard,
    },
    {
      // Local path (not ROUTES.*): src/config/routes.config.ts is mid-edit
      // by 001-contributor-profile-redirect. Mirrors
      // CONTRIBUTOR_GITHUB_REPOSITORIES_PATH in
      // routes/_appLayout/github.repositories.tsx.
      label: "مستودعات GitHub",
      href: "/github/repositories",
      icon: Github,
      active: pathname === "/github/repositories",
    },
    {
      label: "استكشاف",
      href: ROUTES.explore,
      icon: Compass,
      active: pathname === ROUTES.explore,
    },
    {
      label: "المهام",
      href: ROUTES.tasks,
      icon: ListTodo,
      active: pathname.startsWith(ROUTES.tasks),
    },
    { label: "طلبات الانضمام", href: "#", icon: FileText, badge: 1 },
    { label: "مهاراتي", href: "#", icon: BadgeCheck, hideOnMobile: true },
    { label: "الإعدادات", href: "#", icon: Settings, secondary: true },
  ];

  return (
    <AppShell
      nav={nav}
      planChip={{ planName: "Bronze", quotaLabel: "1 من 2 طلبات اليوم" }}
    >
      <Outlet />
    </AppShell>
  );
}
