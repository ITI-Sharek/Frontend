// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminSkillReviewWorkspace } from "./admin-skill-review-workspace";
import type { PendingSkillReviewsDto } from "../types/admin-skill-review.types";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/admin/skills">{children}</a>,
}));

vi.mock("../api/mutations/use-admin-skill-review-mutations", () => ({
  useApproveSkillReviewMutation: () => ({
    data: undefined,
    isPending: false,
    mutate: vi.fn(),
  }),
  useRejectSkillReviewMutation: () => ({
    data: undefined,
    isPending: false,
    mutate: vi.fn(),
  }),
  useAdjustSkillReviewProficiencyMutation: () => ({
    data: undefined,
    isPending: false,
    mutate: vi.fn(),
  }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const reviews: PendingSkillReviewsDto = {
  items: [
    {
      skillProfileId: "skill-1",
      contributorId: "user-1",
      contributorName: "Sara Ahmed",
      contributorUsername: "sara",
      generationId: "generation-1",
      skillName: "TypeScript",
      proficiencyLevel: "intermediate",
      confidence: 0.82,
      status: "pending",
      evidenceSummary: "Strong evidence.",
      evidenceSources: { evidenceIds: ["github:sara/app"] },
      createdAt: "2026-07-18T00:00:00.000Z",
    },
  ],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

describe("AdminSkillReviewWorkspace", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("uses shared native select and textarea controls for the review decision", async () => {
    await act(async () => {
      root.render(
        <AdminSkillReviewWorkspace contributorId="user-1" reviews={reviews} />,
      );
    });

    const proficiency = container.querySelector<HTMLSelectElement>(
      'select[name="review-proficiency"][data-slot="native-select"]',
    );
    const notes = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="review-notes"][data-slot="textarea"]',
    );

    expect(proficiency?.value).toBe("intermediate");
    expect(proficiency?.querySelectorAll("option")).toHaveLength(3);
    expect(notes).not.toBeNull();
  });
});
