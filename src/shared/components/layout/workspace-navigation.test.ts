import { describe, expect, it } from "vitest";

import { ROUTES } from "@/config/routes.config";

import {
  getAdminNavigation,
  getMemberNavigation,
} from "./workspace-navigation";

describe("workspace navigation", () => {
  it("keeps owner navigation inside owner and shared routes", () => {
    const navigation = getMemberNavigation({
      role: "owner",
      pathname: ROUTES.myProjects,
      username: null,
      unreadCount: 2,
    });

    expect(navigation.map((item) => item.to)).toEqual([
      ROUTES.home,
      ROUTES.myProjects,
      ROUTES.discussions,
      ROUTES.notifications,
      ROUTES.settings,
      ROUTES.support,
    ]);
    expect(navigation.some((item) => item.to === ROUTES.dashboard)).toBe(false);
  });

  it("keeps contributor navigation out of owner project management", () => {
    const navigation = getMemberNavigation({
      role: "contributor",
      pathname: ROUTES.dashboard,
      username: "sara",
      unreadCount: 0,
    });

    expect(navigation.some((item) => item.to === ROUTES.dashboard)).toBe(true);
    expect(navigation.some((item) => item.to === ROUTES.myProjects)).toBe(false);
    expect(
      navigation.some((item) => item.to === ROUTES.contributorProfile("sara")),
    ).toBe(true);
  });

  it("keeps admin notifications inside the admin shell", () => {
    const navigation = getAdminNavigation({
      pathname: ROUTES.adminNotifications,
      unreadCount: 3,
      pendingReviewsCount: 4,
    });

    const notificationItem = navigation.find(
      (item) => item.to === ROUTES.adminNotifications,
    );
    expect(notificationItem).toMatchObject({ active: true, badge: 3 });
    expect(navigation.some((item) => item.to === ROUTES.notifications)).toBe(
      false,
    );
  });

  it("links every implemented admin section to a distinct route", () => {
    const navigation = getAdminNavigation({
      pathname: ROUTES.adminProjectOwners,
      unreadCount: 0,
      pendingReviewsCount: 2,
    });

    expect(navigation.find((item) => item.to === ROUTES.adminProjectOwners)).toMatchObject({
      label: "ملاك المشاريع",
      active: true,
    });
    expect(navigation.some((item) => item.to === ROUTES.adminProfileFields)).toBe(true);

    const enabledRoutes = navigation
      .filter((item) => !item.disabled)
      .map((item) => item.to);
    expect(new Set(enabledRoutes).size).toBe(enabledRoutes.length);
  });
});
