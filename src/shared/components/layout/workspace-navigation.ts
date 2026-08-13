import {
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Github,
  House,
  LayoutDashboard,
  ListTodo,
  MessageCircleQuestion,
  Newspaper,
  NotebookPen,
  PanelsTopLeft,
  Settings,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import type { TFunction } from "i18next";

import { ROUTES } from "@/config/routes.config";

import type { AppShellNavItem } from "./app-shell";

interface MemberNavigationOptions {
  role: "owner" | "contributor";
  pathname: string;
  username: string | null;
  unreadCount: number;
  t: TFunction;
}

interface AdminNavigationOptions {
  pathname: string;
  unreadCount: number;
  pendingReviewsCount: number;
  t: TFunction;
}

function isActivePath(pathname: string, route: string, exact = false): boolean {
  return exact ? pathname === route : pathname === route || pathname.startsWith(`${route}/`);
}

export function getMemberNavigation({
  role,
  pathname,
  username,
  unreadCount,
  t,
}: MemberNavigationOptions): AppShellNavItem[] {
  const homeItem: AppShellNavItem = {
    label: t("navigation.home"),
    to: ROUTES.home,
    icon: House,
    active: isActivePath(pathname, ROUTES.home, true),
  };
  const discussionsItem: AppShellNavItem = {
    label: t("navigation.discussions"),
    to: ROUTES.discussions,
    icon: Newspaper,
    active: isActivePath(pathname, ROUTES.discussions),
  };
  const settingsItem: AppShellNavItem = {
    label: t("navigation.settings"),
    to: ROUTES.settings,
    icon: Settings,
    active: isActivePath(pathname, ROUTES.settings),
    secondary: true,
  };
  const supportItem: AppShellNavItem = {
    label: t("navigation.support"),
    to: ROUTES.support,
    icon: MessageCircleQuestion,
    active: isActivePath(pathname, ROUTES.support),
    secondary: true,
    hideOnMobile: true,
  };

  if (role === "owner") {
    return [
      homeItem,
      {
        label: t("navigation.myProjects"),
        to: ROUTES.myProjects,
        icon: BriefcaseBusiness,
        active: isActivePath(pathname, ROUTES.myProjects),
      },
      discussionsItem,
      {
        label: t("navigation.notifications"),
        to: ROUTES.notifications,
        icon: Bell,
        active: isActivePath(pathname, ROUTES.notifications),
        badge: unreadCount,
      },
      settingsItem,
      supportItem,
    ];
  }

  return [
    homeItem,
    {
      label: t("navigation.dashboard"),
      to: ROUTES.dashboard,
      icon: LayoutDashboard,
      active: isActivePath(pathname, ROUTES.dashboard),
    },
    {
      label: t("navigation.explore"),
      to: ROUTES.explore,
      icon: Compass,
      active: isActivePath(pathname, ROUTES.explore),
    },
    {
      label: t("navigation.tasks"),
      to: ROUTES.tasks,
      icon: ListTodo,
      active: isActivePath(pathname, ROUTES.tasks),
    },
    {
      label: t("navigation.proposals"),
      to: ROUTES.proposals,
      icon: NotebookPen,
      active: isActivePath(pathname, ROUTES.proposals),
    },
    discussionsItem,
    {
      label: t("navigation.skillAnalysis"),
      to: ROUTES.githubSkillAnalysis,
      icon: Github,
      active: isActivePath(pathname, ROUTES.githubSkillAnalysis),
      hideOnMobile: true,
    },
    {
      label: t("navigation.profile"),
      to: username ? ROUTES.contributorProfile(username) : ROUTES.dashboard,
      icon: UserRound,
      active:
        pathname.startsWith("/profile/") &&
        !isActivePath(pathname, ROUTES.githubSkillAnalysis),
      disabled: username === null,
      statusLabel: username === null ? t("navigation.profileLoading") : undefined,
    },
    {
      label: t("navigation.notifications"),
      to: ROUTES.notifications,
      icon: Bell,
      active: isActivePath(pathname, ROUTES.notifications),
      badge: unreadCount,
      hideOnMobile: true,
    },
    settingsItem,
    supportItem,
  ];
}

export function getAdminNavigation({
  pathname,
  unreadCount,
  pendingReviewsCount,
  t,
}: AdminNavigationOptions): AppShellNavItem[] {
  return [
    {
      label: t("navigation.adminOverview"),
      to: ROUTES.admin,
      icon: LayoutDashboard,
      active: isActivePath(pathname, ROUTES.admin, true),
    },
    {
      label: t("navigation.adminSkillReviews"),
      to: ROUTES.adminSkillReviews,
      icon: ClipboardCheck,
      active: isActivePath(pathname, ROUTES.adminSkillReviews),
      badge: pendingReviewsCount,
    },
    {
      label: t("navigation.adminProfileFields"),
      to: ROUTES.adminProfileFields,
      icon: PanelsTopLeft,
      active: isActivePath(pathname, ROUTES.adminProfileFields),
    },
    {
      label: t("navigation.adminExperienceLevels"),
      to: ROUTES.adminExperienceLevels,
      icon: TrendingUp,
      active: isActivePath(pathname, ROUTES.adminExperienceLevels),
    },
    {
      label: t("navigation.adminProjectOwners"),
      to: ROUTES.adminProjectOwners,
      icon: BriefcaseBusiness,
      active: isActivePath(pathname, ROUTES.adminProjectOwners),
    },
    {
      label: t("navigation.adminNotifications"),
      to: ROUTES.adminNotifications,
      icon: Bell,
      active: isActivePath(pathname, ROUTES.adminNotifications),
      badge: unreadCount,
    },
    {
      label: t("navigation.adminUsers"),
      to: ROUTES.admin,
      icon: Users,
      disabled: true,
      statusLabel: t("common.comingSoon"),
      hideOnMobile: true,
    },
  ];
}
