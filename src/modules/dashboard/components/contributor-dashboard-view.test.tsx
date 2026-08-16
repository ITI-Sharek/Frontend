import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ContributorDashboardView } from "./contributor-dashboard-view";
import type { ContributorDashboardDto } from "../types/dashboard.types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode;
    to: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("ContributorDashboardView hierarchy", () => {
  it("leads with the urgent workflow instead of duplicating dashboard navigation", () => {
    const html = renderToStaticMarkup(
      <ContributorDashboardView
        dashboard={makeDashboard()}
        deliveryLifecycleSlot={<section>مسار التسليم النشط</section>}
      />,
    );

    expect(html).toContain("يحتاج انتباهك");
    expect(html).toContain("مسار التسليم النشط");
    expect(html).not.toContain('href="#attention"');
    expect(html).not.toContain("استكشف طلبات المساهمة");
  });

  it("gives an onboarding contributor one direct setup action", () => {
    const html = renderToStaticMarkup(
      <ContributorDashboardView
        dashboard={{ ...makeDashboard(), state: "onboarding" }}
      />,
    );

    expect(html).toContain('href="/onboarding"');
    expect(html).toContain("متابعة إعداد الملف");
    expect(html).toContain('href="/explore"');
  });
});

function makeDashboard(): ContributorDashboardDto {
  return {
    state: "active",
    greetingName: "سارة",
    unreadNotifications: 1,
    quota: { planName: "Free", usedToday: 0, dailyLimit: 1 },
    attentionItems: [
      {
        id: "attention-1",
        kind: "changes_requested",
        title: "مطلوب تعديل التسليم",
        subtitle: "ملاحظات صاحب المشروع مرفقة",
        actionLabel: "افتح وعدّل",
      },
    ],
    matchReason: "React",
    matchedTasks: [],
    growth: {
      ratingPrevious: null,
      ratingCurrent: null,
      completedCount: 0,
      successRate: null,
      skillsVerifiedThisMonth: 0,
    },
    applications: { pendingOwnerReviewCount: 1 },
    onboardingSteps: [
      {
        id: "github",
        label: "ربط GitHub",
        status: "in_progress",
        hint: null,
      },
    ],
    fullyMatchedTasksCount: 0,
  };
}
