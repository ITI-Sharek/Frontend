import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  createContributionRequestDraft,
  discardContributionRequestDraft,
  getContributionRequest,
  updateContributionRequestDraft,
} from "./contribution-requests.service";
import type { ContributionRequestDraftPayload } from "../types/contribution-request.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("Contribution Request service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a private draft without sending ownerId", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: responseDto() });
    const payload = draftPayload();

    const result = await createContributionRequestDraft(
      "project id",
      payload,
      "create-request-001",
    );

    expect(result.requiredRequirements[0]?.position).toBe(0);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/projects/project%20id/contribution-requests",
      payload,
      { headers: { "Idempotency-Key": "create-request-001" } },
    );
    expect(payload).not.toHaveProperty("ownerId");
  });

  it("loads a known owned request and rejects malformed responses", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: responseDto() });
    await expect(getContributionRequest("request id")).resolves.toMatchObject({
      id: "request-1",
      status: "draft",
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contribution-requests/request%20id",
    );

    mockedAxios.get.mockResolvedValueOnce({ data: { id: "incomplete" } });
    await expect(getContributionRequest("request-1")).rejects.toThrow();
  });

  it("updates and discards through command endpoints with retry keys", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: responseDto() });
    mockedAxios.post.mockResolvedValueOnce({
      data: responseDto({ status: "discarded" }),
    });

    await updateContributionRequestDraft(
      "request-1",
      draftPayload(),
      "update-request-001",
    );
    await discardContributionRequestDraft(
      "request-1",
      { reason: "Scope changed" },
      "discard-request-001",
    );

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/contribution-requests/request-1",
      draftPayload(),
      { headers: { "Idempotency-Key": "update-request-001" } },
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contribution-requests/request-1/discard",
      { reason: "Scope changed" },
      { headers: { "Idempotency-Key": "discard-request-001" } },
    );
  });
});

function draftPayload(): ContributionRequestDraftPayload {
  return {
    title: "Build a webhook viewer",
    description: "Implement the private draft workflow safely.",
    requiredRequirements: [{ text: "Deliver tested endpoints" }],
    preferredRequirements: [{ text: "Document the contract" }],
    technologyTags: ["NestJS"],
    applicationsCloseTime: "2030-03-10T12:00:00.000Z",
    targetCompletionDate: "2030-03-20",
    difficulty: "intermediate",
    reward: 150,
    rewardCurrency: "USD",
  };
}

function responseDto(overrides: Record<string, unknown> = {}) {
  return {
    id: "request-1",
    projectId: "project-1",
    title: "Build a webhook viewer",
    description: "Implement the private draft workflow safely.",
    requiredRequirements: [
      { id: "required-1", kind: "required", position: 0, text: "Deliver tested endpoints" },
    ],
    preferredRequirements: [
      { id: "preferred-1", kind: "preferred", position: 0, text: "Document the contract" },
    ],
    technologyTags: ["NestJS"],
    applicationsCloseTime: "2030-03-10T12:00:00.000Z",
    targetCompletionDate: "2030-03-20",
    difficulty: "intermediate",
    reward: "150.00",
    rewardCurrency: "USD",
    status: "draft",
    publishedAt: null,
    createdAt: "2026-07-28T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
    ...overrides,
  };
}
