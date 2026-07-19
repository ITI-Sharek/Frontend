import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  adjustSkillReviewProficiency,
  approveSkillReview,
  listPendingSkillReviews,
  rejectSkillReview,
} from "./admin-skill-reviews.service";
import type {
  PendingSkillReviewsDto,
  SkillProfileReviewResultDto,
} from "../types/admin-skill-review.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

const pendingReviews: PendingSkillReviewsDto = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

const reviewResult: SkillProfileReviewResultDto = {
  skill: {
    skillProfileId: "skill-1",
    contributorId: "user-1",
    contributorName: "Sara Ahmed",
    skillName: "TypeScript",
    proficiencyLevel: "advanced",
    confidence: 0.9,
    status: "approved",
    evidenceSummary: "Strong evidence.",
    evidenceSources: null,
    originalProficiency: "intermediate",
    adminNotes: "Approved as advanced.",
    reviewedBy: "admin-1",
    reviewedAt: "2026-07-19T00:00:00.000Z",
  },
  decision: {
    decisionId: "decision-1",
    skillProfileId: "skill-1",
    reviewerId: "admin-1",
    action: "approve",
    previousStatus: "pending",
    newStatus: "approved",
    previousProficiency: "intermediate",
    newProficiency: "advanced",
    notes: "Approved as advanced.",
    createdAt: "2026-07-19T00:00:00.000Z",
  },
  activation: {
    userId: "user-1",
    activated: true,
    status: "active",
  },
  notification: {
    notificationId: "notification-1",
    created: true,
    deliveredRealtime: true,
  },
};

describe("admin skill review service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads pending skill reviews with pagination", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: pendingReviews });

    await expect(
      listPendingSkillReviews({ page: 2, limit: 50 }),
    ).resolves.toEqual(pendingReviews);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/admin/skill-reviews/pending",
      { params: { page: 2, limit: 50 } },
    );
  });

  it("approves a skill review", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: reviewResult });

    await expect(
      approveSkillReview("skill-1", {
        proficiency: "advanced",
        notes: "Approved as advanced.",
      }),
    ).resolves.toEqual(reviewResult);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/admin/skill-reviews/skill-1/approve",
      { proficiency: "advanced", notes: "Approved as advanced." },
    );
  });

  it("rejects a skill review with required notes", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: reviewResult });

    await rejectSkillReview("skill-1", { notes: "Weak evidence." });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/admin/skill-reviews/skill-1/reject",
      { notes: "Weak evidence." },
    );
  });

  it("adjusts proficiency without approving the skill", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: reviewResult });

    await adjustSkillReviewProficiency("skill-1", {
      proficiency: "intermediate",
      notes: "Calibrated before final decision.",
    });

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/admin/skill-reviews/skill-1/proficiency",
      {
        proficiency: "intermediate",
        notes: "Calibrated before final decision.",
      },
    );
  });
});
