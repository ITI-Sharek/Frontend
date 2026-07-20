import {
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Github,
  LayoutDashboard,
  ListTodo,
  PanelsTopLeft,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { ROUTES } from "@/config/routes.config";

import type { AppShellNavItem } from "./app-shell";

interface MemberNavigationOptions {
  role: "owner" | "contributor";
  pathname: string;
  username: string | null;
  unreadCount: number;
}

interface AdminNavigationOptions {
  pathname: string;
  unreadCount: number;
  pendingReviewsCount: number;
}

function isActivePath(pathname: string, route: string, exact = false): boolean {
  return exact ? pathname === route : pathname === route || pathname.startsWith(`${route}/`);
}

export function getMemberNavigation({
  role,
  pathname,
  username,
  unreadCount,
}: MemberNavigationOptions): AppShellNavItem[] {
  const settingsItem: AppShellNavItem = {
    label: "الإعدادات",
    to: ROUTES.settings,
    icon: Settings,
    active: isActivePath(pathname, ROUTES.settings),
    secondary: true,
  };

  if (role === "owner") {
    return [
      {
        label: "مشاريعي",
        to: ROUTES.myProjects,
        icon: BriefcaseBusiness,
        active: isActivePath(pathname, ROUTES.myProjects),
      },
      {
        label: "الإشعارات",
        to: ROUTES.notifications,
        icon: Bell,
        active: isActivePath(pathname, ROUTES.notifications),
        badge: unreadCount,
      },
      settingsItem,
    ];
  }

  return [
    {
      label: "لوحة التحكم",
      to: ROUTES.dashboard,
      icon: LayoutDashboard,
      active: isActivePath(pathname, ROUTES.dashboard),
    },
    {
      label: "استكشاف",
      to: ROUTES.explore,
      icon: Compass,
      active: isActivePath(pathname, ROUTES.explore),
    },
    {
      label: "المهام",
      to: ROUTES.tasks,
      icon: ListTodo,
      active: isActivePath(pathname, ROUTES.tasks),
    },
    {
      label: "مستودعات GitHub",
      to: "/github/repositories",
      icon: Github,
      active: isActivePath(pathname, "/github/repositories"),
      hideOnMobile: true,
    },
    {
      label: "الملف الشخصي",
      to: username ? ROUTES.contributorProfile(username) : ROUTES.dashboard,
      icon: UserRound,
      active: pathname.startsWith("/profile/"),
      disabled: username === null,
      statusLabel: username === null ? "جارٍ التحميل" : undefined,
    },
    {
      label: "الإشعارات",
      to: ROUTES.notifications,
      icon: Bell,
      active: isActivePath(pathname, ROUTES.notifications),
      badge: unreadCount,
      hideOnMobile: true,
    },
    settingsItem,
  ];
}

export function getAdminNavigation({
  pathname,
  unreadCount,
  pendingReviewsCount,
}: AdminNavigationOptions): AppShellNavItem[] {
  return [
    {
      label: "نظرة عامة",
      to: ROUTES.admin,
      icon: LayoutDashboard,
      active: isActivePath(pathname, ROUTES.admin, true),
    },
    {
      label: "مراجعة المهارات",
      to: ROUTES.adminSkillReviews,
      icon: ClipboardCheck,
      active: isActivePath(pathname, ROUTES.adminSkillReviews),
      badge: pendingReviewsCount,
    },
    {
      label: "مجالات المساهمين",
      to: ROUTES.adminProfileFields,
      icon: PanelsTopLeft,
      active: isActivePath(pathname, ROUTES.adminProfileFields),
    },
    {
      label: "ملاك المشاريع",
      to: ROUTES.adminProjectOwners,
      icon: BriefcaseBusiness,
      active: isActivePath(pathname, ROUTES.adminProjectOwners),
    },
    {
      label: "الإشعارات",
      to: ROUTES.adminNotifications,
      icon: Bell,
      active: isActivePath(pathname, ROUTES.adminNotifications),
      badge: unreadCount,
    },
    {
      label: "المستخدمون",
      to: ROUTES.admin,
      icon: Users,
      disabled: true,
      statusLabel: "قريباً",
      hideOnMobile: true,
    },
  ];
}
