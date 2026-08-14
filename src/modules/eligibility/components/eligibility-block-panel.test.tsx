// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BlockedSubmitAction,
  EligibilityBlockPanel,
} from "./eligibility-block-panel";

const requestGuidance = vi.fn();
vi.mock("../api/mutations/use-request-eligibility-guidance-mutation", () => ({
  useRequestEligibilityGuidanceMutation: () => ({
    mutateAsync: requestGuidance,
    isPending: false,
  }),
}));

const guidanceQuery = vi.fn();
vi.mock("../api/queries/use-eligibility-guidance-query", () => ({
  useEligibilityGuidanceQuery: (id: string | null) => guidanceQuery(id),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const blockingSkills = [
  {
    skillName: "React",
    requiredLevel: "advanced" as const,
    contributorLevel: "beginner" as const,
  },
  {
    skillName: "Rust",
    requiredLevel: "intermediate" as const,
    contributorLevel: null,
  },
];

describe("EligibilityBlockPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    requestGuidance.mockResolvedValue({ id: "guidance-1" });
    guidanceQuery.mockReturnValue({ data: undefined });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  const render = (props: Partial<
    Parameters<typeof EligibilityBlockPanel>[0]
  > = {}) =>
    act(async () =>
      root.render(
        <EligibilityBlockPanel
          blockingSkills={blockingSkills}
          skillAnalysisHref="/profile/github"
          {...props}
        />,
      ),
    );

  describe("what the contributor is told", () => {
    it("names every blocking skill with the required and held level", async () => {
      await render();

      expect(container.textContent).toContain("React");
      expect(container.textContent).toContain("Rust");
      // Required advanced, held beginner — both levels stated, not just "too low".
      expect(container.textContent).toContain("متقدم");
      expect(container.textContent).toContain("مبتدئ");
    });

    it("distinguishes no approved evidence from a level that is too low", async () => {
      // Different situations with different recovery advice: one contributor
      // needs to add evidence, the other needs to deepen it.
      await render();

      expect(container.textContent).toContain("لا توجد أدلة موثقة بعد");
    });

    it("reads as 'not yet', never as a rejection", async () => {
      await render();

      expect(container.textContent).toContain("ليس بعد");
      // No language of refusal or failure anywhere in the panel.
      for (const word of ["رفض", "مرفوض", "فشل"]) {
        expect(container.textContent).not.toContain(word);
      }
      // And it is not announced as an error, which would frame it as a fault.
      expect(container.querySelector('[role="alert"]')).toBeNull();
    });

    it("offers the recovery path to the skill analysis workspace", async () => {
      await render();

      const link = container.querySelector('a[href="/profile/github"]');
      expect(link).not.toBeNull();
      expect(link?.textContent).toContain("أضف مستودعات");
    });

    it("hands the blocking skills to the recovery navigation", async () => {
      // So the target page can highlight exactly what is missing instead of
      // making the contributor rediscover it there.
      const onRecoveryNavigate = vi.fn();
      await render({ onRecoveryNavigate });

      const link = container.querySelector('a[href="/profile/github"]');
      await act(async () => (link as HTMLAnchorElement).click());

      expect(onRecoveryNavigate).toHaveBeenCalledWith(blockingSkills);
    });
  });

  describe("accessibility", () => {
    it("announces the skills as a labelled list, not a bare grid", async () => {
      // The count and the boundaries between entries have to be announced;
      // "two skills" is the first thing a screen reader user needs.
      await render();

      const list = container.querySelector("ul[aria-label]");
      expect(list).not.toBeNull();
      expect(list?.querySelectorAll("li")).toHaveLength(2);
    });

    it("never carries meaning by the +/- glyphs alone", async () => {
      await render();

      const glyphs = [...container.querySelectorAll("span[aria-hidden='true']")]
        .map((node) => node.textContent.trim())
        .filter((text) => text === "+" || text === "−");
      expect(glyphs.length).toBeGreaterThan(0);
      // Every glyph is decorative; the same information is in the text.
      expect(container.textContent).toContain("يحتاج هذا العمل");
      expect(container.textContent).toContain("مستواك الموثق");
    });

    it("forces skill names to LTR inside Arabic copy", async () => {
      await render();

      const ltr = [...container.querySelectorAll("[dir='ltr']")].map(
        (node) => node.textContent,
      );
      expect(ltr.join(" ")).toContain("React");
    });
  });

  describe("guidance", () => {
    it("is not requested when there is no recorded evaluation", async () => {
      // The refusal path carries named skills but no evaluation id. The reason
      // still shows; only the narrative is unavailable.
      await render({ eligibilityEvaluationId: null });

      expect(requestGuidance).not.toHaveBeenCalled();
      expect(container.textContent).toContain("React");
    });

    it("announces the pending state in a polite live region", async () => {
      guidanceQuery.mockReturnValue({ data: { status: "pending" } });

      await render({ eligibilityEvaluationId: "evaluation-1" });

      const live = container.querySelector('[aria-live="polite"]');
      expect(live).not.toBeNull();
      expect(live?.textContent).toContain("جارٍ تجهيز خطواتك التالية");
      // Polite, not assertive: it must not interrupt someone reading the list.
      expect(live?.getAttribute("aria-live")).toBe("polite");
    });

    it("does not steal focus when the narrative arrives", async () => {
      guidanceQuery.mockReturnValue({ data: { status: "pending" } });
      await render({ eligibilityEvaluationId: "evaluation-1" });

      const before = document.activeElement;
      guidanceQuery.mockReturnValue({
        data: { status: "ready", narrative: "Add two React repositories." },
      });
      await render({ eligibilityEvaluationId: "evaluation-1" });

      expect(document.activeElement).toBe(before);
      expect(container.textContent).toContain("Add two React repositories.");
    });

    it("keeps the deterministic reason when generation fails", async () => {
      // The criterion that matters most: never told only "you are blocked".
      guidanceQuery.mockReturnValue({ data: { status: "failed" } });

      await render({ eligibilityEvaluationId: "evaluation-1" });

      expect(container.textContent).toContain("تعذر تجهيز الخطوات الآن");
      expect(container.textContent).toContain("React");
      expect(container.textContent).toContain("Rust");
    });

    it("keeps the reason when the guidance request itself never lands", async () => {
      requestGuidance.mockRejectedValue(new Error("network"));

      await render({ eligibilityEvaluationId: "evaluation-1" });

      expect(container.textContent).toContain("تعذر تجهيز الخطوات الآن");
      expect(container.textContent).toContain("React");
    });
  });
});

describe("BlockedSubmitAction", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
  });

  it("says why it is disabled, not merely that it is", async () => {
    // `disabled` alone announces "unavailable" with no reason — the dead end
    // this whole feature exists to remove.
    await act(async () =>
      root.render(<BlockedSubmitAction blockingSkillCount={2} />),
    );

    const button = container.querySelector("button");
    expect(button?.disabled).toBe(true);
    const label = button?.getAttribute("aria-label") ?? "";
    expect(label).toContain("التقديم غير متاح بعد");
    expect(label).toContain("مهارتان");
    expect(button?.getAttribute("aria-describedby")).toBe(
      "eligibility-block-panel",
    );
  });

  it("uses the Arabic dual form for two skills, not a digit", async () => {
    await act(async () =>
      root.render(<BlockedSubmitAction blockingSkillCount={2} />),
    );
    expect(container.querySelector("button")?.getAttribute("aria-label")).toContain(
      "مهارتان",
    );
  });

  it("uses the singular form for one skill", async () => {
    await act(async () =>
      root.render(<BlockedSubmitAction blockingSkillCount={1} />),
    );
    expect(container.querySelector("button")?.getAttribute("aria-label")).toContain(
      "مهارة واحدة",
    );
  });
});
