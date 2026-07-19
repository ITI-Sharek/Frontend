import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatConfidence,
  formatWaitingAge,
  getAgingBand,
  groupPendingSkillReviews,
  renderEvidenceSources,
} from "./admin-skill-review-presenter";
import type { PendingSkillReviewItemDto } from "../types/admin-skill-review.types";

function makeItem(
  overrides: Partial<PendingSkillReviewItemDto>,
): PendingSkillReviewItemDto {
  return {
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
    ...overrides,
  };
}

describe("admin skill review presenter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups pending skill rows by contributor oldest first", () => {
    const groups = groupPendingSkillReviews([
      makeItem({
        skillProfileId: "skill-b",
        contributorId: "user-2",
        contributorName: "Mona",
        createdAt: "2026-07-19T10:00:00.000Z",
      }),
      makeItem({
        skillProfileId: "skill-a",
        contributorId: "user-1",
        createdAt: "2026-07-18T08:00:00.000Z",
      }),
    ]);

    expect(groups.map((group) => group.contributorId)).toEqual([
      "user-1",
      "user-2",
    ]);
    expect(groups[0]?.averageConfidence).toBe(0.82);
  });

  it("formats confidence and waiting age for queue display", () => {
    expect(formatConfidence(0.915)).toBe("92%");
    expect(formatWaitingAge("2026-07-18T00:00:00.000Z")).toBe("1 يوم");
    expect(getAgingBand("2026-07-16T00:00:00.000Z")).toBe("critical");
  });

  it("renders backend evidence ids compactly", () => {
    expect(
      renderEvidenceSources({ evidenceIds: ["github:sara/app", "repo:api"] }),
    ).toBe("github:sara/app · repo:api");
  });
});
