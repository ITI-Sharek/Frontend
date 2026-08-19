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

  it("offers the plan to a free contributor instead of an empty matched grid", () => {
    // The backend answers a free contributor 200 with a reason, not 403. The
    // section used to render its heading over nothing, which is where the
    // upgrade prompt belongs.
    const html = renderToStaticMarkup(
      <ContributorDashboardView
        dashboard={{
          ...makeDashboard(),
          matching: {
            planType: "free",
            reason: "MATCHING_REQUIRES_SUBSCRIPTION",
          },
        }}
        matchedProjectsLockedSlot={<section>الخطة الذهبية</section>}
      />,
    );

    expect(html).toContain("الخطة الذهبية");
    expect(html).not.toContain("فرص مناسبة لك");
  });

  it("draws a partial fit as partial rather than as a complete one", () => {
    const html = renderToStaticMarkup(
      <ContributorDashboardView dashboard={makeDashboard({ matched: true })} />,
    );

    // Two of three, not three of three: the counts are of the required bar,
    // and the card names every required skill, not only the matched ones.
    expect(html).toContain("توافق 2/3");
    expect(html).toContain("Kubernetes");
  });

  it("lists the matches in the state that celebrates the count", () => {
    // "N requests fully match you today" used to state a number and show no
    // matches at all -- the state a contributor lands in before their first
    // application, and the one they subscribed for.
    const html = renderToStaticMarkup(
      <ContributorDashboardView
        dashboard={{
          ...makeDashboard({ matched: true }),
          state: "verified-empty",
        }}
      />,
    );

    expect(html).toContain("Build the ingestion worker");
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

function makeDashboard(
  options: { matched?: boolean } = {},
): ContributorDashboardDto {
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
    matchedTasks: options.matched
      ? [
          {
            id: "request-1",
            title: "Build the ingestion worker",
            projectName: "Share-k API",
            requiredSkills: ["NestJS", "PostgreSQL", "Kubernetes"],
            matchedSkills: ["NestJS", "PostgreSQL"],
            matchedCount: 2,
            requiredCount: 3,
          },
        ]
      : [],
    matching: {
      planType: "gold",
      reason: options.matched ? null : "NO_MATCHING_REQUESTS",
    },
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
