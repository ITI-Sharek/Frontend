import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  acceptApplication,
  declineApplication,
  getApplication,
  getOwnerApplications,
  reportDecisionFeedback,
} from "./applications.service";
import type { ApplicationDto } from "../types/application.types";
import type { OwnerDecisionResultDto } from "../types/assignment.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("applications service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("unwraps the owner queue returned oldest-first by the backend", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { applications: [pendingApplication] },
    });

    await expect(getOwnerApplications("request 1")).resolves.toEqual([
      pendingApplication,
    ]);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/tasks/request%201/applications",
    );
  });

  it("loads one contextually authorized Application detail", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: pendingApplication });

    await expect(getApplication("application 1")).resolves.toEqual(
      pendingApplication,
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/applications/application%201",
    );
  });

  it("accepts with an Idempotency-Key header and no body", async () => {
    const result = decisionResult("ACCEPTED");
    mockedAxios.post.mockResolvedValueOnce({ data: result });

    await expect(
      acceptApplication({
        applicationId: "application 1",
        idempotencyKey: "idem-accept",
      }),
    ).resolves.toEqual(result);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/application%201/accept",
      undefined,
      { headers: { "Idempotency-Key": "idem-accept" } },
    );
  });

  it("declines with human feedback and an Idempotency-Key header", async () => {
    const result = decisionResult("DECLINED_BY_OWNER");
    mockedAxios.post.mockResolvedValueOnce({ data: result });

    await expect(
      declineApplication({
        applicationId: "application 1",
        feedback: "The test strategy needs more detail.",
        idempotencyKey: "idem-decline",
      }),
    ).resolves.toEqual(result);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/application%201/decline",
      { feedback: "The test strategy needs more detail." },
      { headers: { "Idempotency-Key": "idem-decline" } },
    );
  });

  it("creates a moderation report without changing the Application", async () => {
    const report = {
      id: "report-1",
      ownerDecisionId: "decision-1",
      reason: "harassment" as const,
      description: "The feedback contains inappropriate language.",
      status: "open" as const,
      createdAt: "2026-07-30T12:00:00.000Z",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: report });

    await expect(
      reportDecisionFeedback({
        ownerDecisionId: "decision 1",
        reason: "harassment",
        description: report.description,
      }),
    ).resolves.toEqual(report);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/owner-decisions/decision%201/reports",
      {
        reason: "harassment",
        description: report.description,
      },
    );
  });
});

export const pendingApplication: ApplicationDto = {
  id: "application-1",
  contributionRequestId: "request-1",
  contributor: {
    id: "contributor-1",
    username: "sara",
    displayName: "سارة أحمد",
  },
  profileContext: {
    bio: "مساهمة Backend",
    availability: "10 ساعات أسبوعيًا",
    experienceLevel: {
      key: "intermediate",
      labelEn: "Intermediate",
      labelAr: "متوسط",
    },
    fields: [{ key: "backend", labelEn: "Backend", labelAr: "الخلفية" }],
    declaredSkills: ["NestJS"],
  },
  contributionApproach: "سأنفذ التدفق وأضيف اختبارات عقد وتكامل.",
  proposedDeliveryDurationDays: 5,
  status: "PENDING_OWNER_REVIEW",
  requirementSnapshot: {
    required: [{ id: "req-1", position: 0, text: "تدفق مُختبر" }],
    preferred: [],
  },
  evidenceSummary: [
    {
      skillProfileId: "skill-1",
      name: "NestJS",
      proficiencyLevel: "intermediate",
      evidenceSummary: "نفذت واجهات API مختبرة.",
      limitations: ["لا يوجد دليل حديث على معالجة الطوابير."],
    },
  ],
  submittedAt: "2026-07-28T10:00:00.000Z",
  reviewDueAt: "2026-07-31T10:00:00.000Z",
  expiresAt: "2026-08-04T10:00:00.000Z",
  expiredAt: null,
  overdue: false,
  ownerDecision: null,
  assignment: null,
};

function decisionResult(
  status: "ACCEPTED" | "DECLINED_BY_OWNER",
): OwnerDecisionResultDto {
  const application: ApplicationDto = {
    ...pendingApplication,
    status,
    ownerDecision: {
      id: "decision-1",
      applicationId: pendingApplication.id,
      contributionRequestId: pendingApplication.contributionRequestId,
      decisionType: status === "ACCEPTED" ? "ACCEPTED" : "DECLINED",
      feedback:
        status === "ACCEPTED"
          ? null
          : "The test strategy needs more detail.",
      decidedAt: "2026-07-30T12:00:00.000Z",
    },
  };
  return {
    application,
    ownerDecision: application.ownerDecision!,
    assignment:
      status === "ACCEPTED"
        ? {
            id: "assignment-1",
            contributionRequestId: pendingApplication.contributionRequestId,
            applicationId: pendingApplication.id,
            ownerDecisionId: "decision-1",
            contributorId: pendingApplication.contributor.id,
            agreedDeliveryDurationDays: 5,
            agreedDeliveryDueDate: "2026-08-04T12:00:00.000Z",
            assignedAt: "2026-07-30T12:00:00.000Z",
          }
        : null,
  };
}
