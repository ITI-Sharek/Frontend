import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  acceptApplication,
  declineApplication,
  getApplication,
  getOwnerApplications,
  submitApplication,
  withdrawApplication,
} from "./applications.service";
import type { ApplicationDto } from "../types/application.types";
import type { AcceptApplicationResultDto } from "../types/assignment.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

const pendingApplication: ApplicationDto = {
  id: "app-1",
  contributionRequestId: "cr-1",
  contributor: {
    id: "user-1",
    username: "sara",
    displayName: "Sara Ahmed",
  },
  profileContext: {
    bio: "Frontend contributor",
    availability: "10 hours/week",
    experienceLevel: {
      key: "intermediate",
      labelEn: "Intermediate",
      labelAr: "متوسط",
    },
    fields: [],
    declaredSkills: ["React"],
  },
  contributionApproach: "I will build the panel with the existing WS gateway.",
  proposedDeliveryDurationDays: 5,
  requirementSnapshot: {
    required: [
      { id: "requirement-1", position: 0, text: "Ship tested behavior" },
    ],
    preferred: [],
  },
  evidenceSummary: [],
  status: "PENDING_OWNER_REVIEW",
  submittedAt: "2026-07-28T10:00:00.000Z",
  reviewDueAt: "2026-08-04T10:00:00.000Z",
  expiresAt: "2026-08-04T10:00:00.000Z",
  expiredAt: null,
  overdue: false,
  ownerDecision: null,
  assignment: null,
};

describe("applications service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits an Application that enters PENDING_OWNER_REVIEW immediately — no AI or quota copy", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: pendingApplication });

    await expect(
      submitApplication("cr-1", {
        contributionApproach: pendingApplication.contributionApproach ?? "",
        proposedDeliveryDurationDays: 5,
        idempotencyKey: "idem-1",
      }),
    ).resolves.toEqual(pendingApplication);
    expect(mockedAxios.post).toHaveBeenCalledWith("/tasks/cr-1/applications", {
      contributionApproach: pendingApplication.contributionApproach,
      proposedDeliveryDurationDays: 5,
      idempotencyKey: "idem-1",
    });
  });

  it("loads one Application status through the actor-authorized endpoint", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: pendingApplication });

    await expect(getApplication("app-1")).resolves.toEqual(pendingApplication);
    expect(mockedAxios.get).toHaveBeenCalledWith("/applications/app-1");
  });

  it("withdraws an Application before an Owner Decision", async () => {
    const withdrawn: ApplicationDto = {
      ...pendingApplication,
      status: "WITHDRAWN",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: withdrawn });

    await expect(
      withdrawApplication("app-1", "withdraw-idem-1"),
    ).resolves.toEqual(withdrawn);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/app-1/withdraw",
      undefined,
      { headers: { "Idempotency-Key": "withdraw-idem-1" } },
    );
  });

  it("lists every PENDING_OWNER_REVIEW Application for the owner, unconditioned on assessment state", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { applications: [pendingApplication] },
    });

    await expect(getOwnerApplications("cr-1")).resolves.toEqual([
      pendingApplication,
    ]);
    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/cr-1/applications");
  });

  it("accepts an Application, creating an Assignment", async () => {
    const result: AcceptApplicationResultDto = {
      application: { ...pendingApplication, status: "ACCEPTED" },
      ownerDecision: {
        id: "decision-1",
        applicationId: "app-1",
        contributionRequestId: "cr-1",
        decisionType: "ACCEPTED",
        feedback: null,
        decidedAt: "2026-07-29T09:00:00.000Z",
      },
      assignment: {
        id: "assign-1",
        contributionRequestId: "cr-1",
        applicationId: "app-1",
        ownerDecisionId: "decision-1",
        contributorId: "user-1",
        agreedDeliveryDurationDays: 5,
        assignedAt: "2026-07-29T09:00:00.000Z",
        agreedDeliveryDueDate: "2026-08-03",
      },
    };
    mockedAxios.post.mockResolvedValueOnce({ data: result });

    await expect(acceptApplication("app-1")).resolves.toEqual(result);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/app-1/accept",
    );
  });

  it("declines an Application with a human reason, separate from any AI finding", async () => {
    const declined: ApplicationDto = {
      ...pendingApplication,
      status: "DECLINED_BY_OWNER",
    };
    mockedAxios.post.mockResolvedValueOnce({ data: declined });

    await expect(
      declineApplication({ applicationId: "app-1", reason: "Scope mismatch" }),
    ).resolves.toEqual(declined);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/app-1/decline",
      { reason: "Scope mismatch" },
    );
  });
});
