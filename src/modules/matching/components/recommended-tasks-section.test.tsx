// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  RecommendedTaskDto,
  RecommendedTasksResponseDto,
} from "../types/matching.types";
import { RecommendedTasksSection } from "./recommended-tasks-section";

vi.mock("../api/queries/use-matching-queries", () => ({
  useRecommendedTasksQuery: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const { useRecommendedTasksQuery } = await import(
  "../api/queries/use-matching-queries"
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function recommendation(
  overrides: Partial<RecommendedTaskDto> = {},
): RecommendedTaskDto {
  return {
    requestId: "request-1",
    projectName: "Share-k API",
    title: "Build the ingestion worker",
    rank: 1,
    confidence: "HIGH",
    justification: "Your approved NestJS matches what this request asks for.",
    matchedSkills: [
      { name: "NestJS", proficiency: "advanced", evidenceIds: ["skill-1"] },
    ],
    requiredSkillNames: ["NestJS"],
    matchedRequiredCount: 1,
    requiredSkillCount: 1,
    applicationsCloseAt: "2026-09-01T00:00:00.000Z",
    targetCompletionDate: null,
    difficulty: "intermediate",
    reward: null,
    rewardCurrency: null,
    ...overrides,
  };
}

function mockResponse(value: RecommendedTasksResponseDto) {
  vi.mocked(useRecommendedTasksQuery).mockReturnValue({
    data: value,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as never);
}

describe("RecommendedTasksSection", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mockResponse({
      planType: "gold",
      reason: null,
      recommendations: [recommendation()],
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  describe("Gold with matches", () => {
    it("names the skills that matched and the reason", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.textContent).toContain("Build the ingestion worker");
      expect(container.textContent).toContain("Share-k API");
      expect(container.textContent).toContain(
        "Your approved NestJS matches what this request asks for.",
      );
      expect(container.textContent).toContain("NestJS · advanced");
    });

    it("shows position and a categorical band, never a number to compare", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.textContent).toContain("#1");
      expect(container.textContent).toContain("عالية");
    });

    it("renders no percentage anywhere in the match metadata", async () => {
      mockResponse({
        planType: "gold",
        reason: null,
        recommendations: [
          recommendation({ rank: 1, confidence: "HIGH" }),
          recommendation({
            requestId: "request-2",
            rank: 2,
            confidence: "MEDIUM",
          }),
          recommendation({
            requestId: "request-3",
            rank: 3,
            confidence: "LOW",
          }),
        ],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      // DEC-010. The card used to render `${Math.round(score * 100)}%`.
      expect(container.textContent).not.toContain("%");
      expect(container.innerHTML).not.toContain("matchScore");
    });

    it("links each match to its contribution request", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      const link = [...container.querySelectorAll("a")].find((anchor) =>
        anchor.getAttribute("href")?.includes("/tasks/"),
      );
      expect(link?.getAttribute("href")).toBe("/tasks/request-1");
    });

    it("forces technical tokens LTR inside an Arabic layout", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      const skill = [...container.querySelectorAll("li")].find((item) =>
        item.textContent.includes("NestJS"),
      );
      expect(skill?.getAttribute("dir")).toBe("ltr");
    });
  });

  describe("Gold with no matches", () => {
    it("explains an empty shortlist without implying a failure", async () => {
      mockResponse({
        planType: "gold",
        reason: "NO_MATCHING_REQUESTS",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.textContent).toContain("لا توجد مشاريع مُطابقة الآن");
      expect(container.querySelector("[role='alert']")).toBeNull();
    });

    it("gives an actionable reason when there are no approved skills yet", async () => {
      mockResponse({
        planType: "gold",
        reason: "NO_APPROVED_SKILLS",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.textContent).toContain("لا توجد لديك مهارات معتمدة بعد");
    });
  });

  describe("free contributor", () => {
    it("shows a locked state naming the benefit and the price", async () => {
      mockResponse({
        planType: "free",
        reason: "MATCHING_REQUIRES_SUBSCRIPTION",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.textContent).toContain("ميزة في الخطة الذهبية");
      expect(container.textContent).toContain("٥٠٠ جنيه / شهريًا");
      // Says what free still keeps, rather than shaming the reader into paying.
      expect(container.textContent).toContain("تحتفظ خطتك المجانية");
    });

    it("links the locked state to the plan page", async () => {
      mockResponse({
        planType: "free",
        reason: "MATCHING_REQUIRES_SUBSCRIPTION",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      const link = container.querySelector("a");
      expect(link?.getAttribute("href")).toBe("/plan");
    });

    it("shows no blurred or placeholder match content behind the lock", async () => {
      mockResponse({
        planType: "free",
        reason: "MATCHING_REQUIRES_SUBSCRIPTION",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      // No fake cards, no silhouettes, nothing that implies hidden results.
      expect(container.querySelectorAll("article")).toHaveLength(0);
      expect(container.innerHTML).not.toContain("blur");
      expect(container.textContent).not.toContain("%");
    });

    it("does not render the free case as an error", async () => {
      mockResponse({
        planType: "free",
        reason: "MATCHING_REQUIRES_SUBSCRIPTION",
        recommendations: [],
      });

      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.querySelector("[role='alert']")).toBeNull();
      expect(container.textContent).not.toContain("تعذّر");
    });
  });

  describe("states", () => {
    it("announces loading", async () => {
      vi.mocked(useRecommendedTasksQuery).mockReturnValue({
        data: undefined,
        isPending: true,
        isError: false,
        refetch: vi.fn(),
      } as never);

      await act(async () => root.render(<RecommendedTasksSection />));

      const live = container.querySelector("[role='status']");
      expect(live?.getAttribute("aria-live")).toBe("polite");
    });

    it("announces a real failure and offers a retry", async () => {
      const refetch = vi.fn();
      vi.mocked(useRecommendedTasksQuery).mockReturnValue({
        data: undefined,
        isPending: false,
        isError: true,
        refetch,
      } as never);

      await act(async () => root.render(<RecommendedTasksSection />));

      expect(container.querySelector("[role='alert']")).not.toBeNull();
      await act(async () => container.querySelector("button")?.click());
      expect(refetch).toHaveBeenCalled();
    });
  });

  describe("keyboard order", () => {
    it("traps no focus and keeps every control reachable and skippable", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      const focusable = container.querySelectorAll(
        "a[href], button, [tabindex]",
      );
      expect(focusable.length).toBeGreaterThan(0);
      for (const element of focusable) {
        // A positive tabindex would reorder the page's tab sequence around this
        // section; -1 would drop a real control out of it entirely.
        const tabindex = element.getAttribute("tabindex");
        expect(tabindex === null || tabindex === "0").toBe(true);
      }
    });

    it("labels its landmark so a screen reader can skip past it", async () => {
      await act(async () => root.render(<RecommendedTasksSection />));

      const section = container.querySelector("section");
      expect(section?.getAttribute("aria-labelledby")).toBe(
        "recommended-tasks-title",
      );
      expect(container.querySelector("#recommended-tasks-title")).not.toBeNull();
    });
  });
});
