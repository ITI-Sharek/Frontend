import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";

import { ROUTES } from "@/config/routes.config";

import {
  getAdminNavigation,
  getMemberNavigation,
} from "./workspace-navigation";

// Minimal mock that returns the key as the label so tests remain key-independent.
const t = ((key: string) => key) as unknown as TFunction;

describe("workspace navigation", () => {
  it("keeps owner navigation inside owner and shared routes", () => {
    const navigation = getMemberNavigation({
      role: "owner",
      pathname: ROUTES.myProjects,
      unreadCount: 2,
      t,
    });

    expect(navigation.map((item) => item.to)).toEqual([
      ROUTES.home,
      ROUTES.myProjects,
      ROUTES.exploreContributors,
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
      unreadCount: 0,
      t,
    });

    expect(navigation.some((item) => item.to === ROUTES.dashboard)).toBe(true);
    expect(navigation.some((item) => item.to === ROUTES.myProjects)).toBe(false);
    expect(navigation.some((item) => item.to === ROUTES.home)).toBe(false);
    expect(navigation.some((item) => item.to === ROUTES.notifications)).toBe(
      false,
    );
    expect(
      navigation.filter((item) => !item.secondary).map((item) => item.to),
    ).toEqual([
      ROUTES.dashboard,
      ROUTES.explore,
      ROUTES.tasks,
      ROUTES.proposals,
    ]);
    expect(navigation.find((item) => item.to === ROUTES.tasks)?.label).toBe(
      "navigation.tasks",
    );
    expect(navigation.find((item) => item.to === ROUTES.proposals)?.label).toBe(
      "navigation.proposals",
    );
    expect(
      navigation.find((item) => item.to === ROUTES.discussions),
    ).toBeUndefined();
    expect(
      navigation.find((item) => item.to === ROUTES.myProjects),
    ).toBeUndefined();
    expect(
      navigation.filter((item) => item.secondary).map((item) => item.to),
    ).toEqual([ROUTES.settings]);
  });

  it("keeps admin notifications inside the admin shell", () => {
    const navigation = getAdminNavigation({
      pathname: ROUTES.adminNotifications,
      unreadCount: 3,
      pendingReviewsCount: 4,
      t,
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
      t,
    });

    expect(navigation.find((item) => item.to === ROUTES.adminProjectOwners)).toMatchObject({
      label: "navigation.adminProjectOwners",
      active: true,
    });
    expect(navigation.some((item) => item.to === ROUTES.adminProfileFields)).toBe(true);

    const enabledRoutes = navigation
      .filter((item) => !item.disabled)
      .map((item) => item.to);
    expect(new Set(enabledRoutes).size).toBe(enabledRoutes.length);
  });
});
