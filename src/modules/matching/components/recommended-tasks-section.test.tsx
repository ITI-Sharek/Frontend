// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RecommendedTasksSection } from "./recommended-tasks-section";

const mocks = vi.hoisted(() => ({ useRecommendedTasksQuery: vi.fn() }));
vi.mock("../api/queries/use-matching-queries", () => ({
  useRecommendedTasksQuery: mocks.useRecommendedTasksQuery,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("RecommendedTasksSection", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mocks.useRecommendedTasksQuery.mockReturnValue({
      data: {
        planType: "gold",
        recommendations: [
          {
            requestId: "request-1",
            projectName: "Social Media Platform",
            title: "Build GraphQL API",
            rank: 1,
            confidence: "HIGH",
            justification: "Matches approved TypeScript and Node.js skills.",
            matchedSkills: [
              { name: "TypeScript", proficiency: "advanced", evidenceIds: ["skill-1"] },
            ],
            applicationsCloseAt: "2026-08-20T00:00:00.000Z",
            targetCompletionDate: null,
            difficulty: "intermediate",
            reward: 75,
            rewardCurrency: "USD",
          },
        ],
      },
      isPending: false,
      isError: false,
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  it("shows why a Gold recommendation appeared and keeps applying ordinary", async () => {
    await act(async () => root.render(<RecommendedTasksSection />));

    expect(container.textContent).toContain("Build GraphQL API");
    expect(container.textContent).toContain("Matches approved TypeScript and Node.js skills.");
    expect(container.textContent).toContain("التقديم متاح وفق القواعد العادية");
    expect(container.querySelector('a[href="/tasks/request-1"]')).not.toBeNull();
  });

  it("shows an honest plan preview when recommendations are unavailable", async () => {
    const planRequired = new AxiosError("plan required");
    planRequired.response = {
      data: { code: "CONTRIBUTOR_RECOMMENDATIONS_PLAN_REQUIRED" },
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
    };
    mocks.useRecommendedTasksQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: planRequired,
    });

    await act(async () => root.render(<RecommendedTasksSection />));

    expect(container.textContent).toContain("التوصيات الشخصية غير متاحة ضمن خطتك الحالية");
    expect(container.textContent).toContain("يمكنك استكشاف كل الطلبات والتقديم");
  });
});
