// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SkillGapGuidancePanel } from "./skill-gap-guidance-panel";

const mutateAsync = vi.fn();
vi.mock("../api/mutations/use-skill-guidance-mutation", () => ({
  useSkillGapGuidanceMutation: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("SkillGapGuidancePanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    mutateAsync.mockResolvedValue({
      kind: "completed",
      missingSkills: [
        {
          requirementId: "requirement-1",
          skillName: "JWT",
          gap: "not_evidenced",
          explanation: "No approved source mentions JWT.",
          evidenceIds: ["requirement-1"],
          uncertainty: ["The supplied evidence may be incomplete."],
        },
      ],
      recommendedTechnologies: [],
      learningResources: [],
      practiceProjects: [],
      improvementPath: [],
      sources: [
        {
          evidenceId: "requirement-1",
          label: "Published Requirement",
          type: "contribution_requirement",
        },
      ],
    });
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    vi.clearAllMocks();
  });

  it("lets an active contributor explicitly request source-scoped guidance", async () => {
    await act(async () =>
      root.render(<SkillGapGuidancePanel contributionRequestId="request-1" />),
    );

    const button = [...container.querySelectorAll("button")].find((item) =>
      item.textContent.includes("إرشاد مرتبط بالمصادر"),
    );
    if (!button) throw new Error("Expected guidance button");
    await act(async () => button.click());

    expect(mutateAsync).toHaveBeenCalledWith("request-1");
    expect(container.textContent).toContain("JWT");
    expect(container.textContent).toContain("وليس قرارًا بشأن أهليتك");
  });
});
