import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  cancelContributionRequest,
  createContributionRequestDraft,
  discardContributionRequestDraft,
  getContributionRequest,
  getContributionRequestById,
  listContributionRequests,
  listOwnerContributionRequestsForProject,
  publishContributionRequest,
  updateContributionRequestDraft,
} from "./contribution-requests.service";
import type {
  ContributionRequestDetailDto,
  ContributionRequestDraftPayload,
  ContributionRequestFeedResponseDto,
} from "../types/contribution-request.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("Contribution Request draft service", () => {
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

  it("publishes a draft through the publish command endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: responseDto({ status: "published", publishedAt: "2026-07-28T00:00:00.000Z" }),
    });

    const result = await publishContributionRequest("request-1", "publish-request-001");

    expect(result.status).toBe("published");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contribution-requests/request-1/publish",
      undefined,
      { headers: { "Idempotency-Key": "publish-request-001" } },
    );
  });

  it("cancels a published request with an optional reason", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: responseDto({ status: "cancelled" }),
    });

    const result = await cancelContributionRequest(
      "request-1",
      { reason: "No longer needed" },
      "cancel-request-001",
    );

    expect(result.status).toBe("cancelled");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/contribution-requests/request-1/cancel",
      { reason: "No longer needed" },
      { headers: { "Idempotency-Key": "cancel-request-001" } },
    );
  });

  it("lists an owned Project's Contribution Requests grouped by lifecycle state", async () => {
    const listResponse = {
      projectId: "project-1",
      totalCount: 2,
      byStatus: {
        draft: [responseDto()],
        published: [],
        assigned: [],
        completed: [],
        cancelled: [responseDto({ id: "request-2", status: "cancelled" })],
        discarded: [],
      },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: listResponse });

    await expect(
      listOwnerContributionRequestsForProject("project 1"),
    ).resolves.toEqual(listResponse);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/projects/project%201/contribution-requests",
    );
  });
});

describe("contribution requests service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists Contribution Requests with feed filters", async () => {
    const response: ContributionRequestFeedResponseDto = {
      items: [
        {
          id: "cr-1",
          projectId: "project-1",
          projectName: "sharek-backend",
          projectSlug: "sharek-backend",
          title: "Build a real-time notifications panel",
          technologyTags: ["React", "Node.js", "WebSocket"],
          difficulty: "intermediate",
          applicationsCloseAt: "2026-08-10T00:00:00.000Z",
          targetCompletionDate: "2026-08-20",
          reward: { amount: 120, currency: "USD" },
        },
      ],
      totalCount: 1,
      technologyFacets: [
        { technology: "React", count: 1 },
        { technology: "Node.js", count: 1 },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(
      listContributionRequests({ technologies: ["React"] }),
    ).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks", {
      params: { technologies: ["React"] },
    });
  });

  it("gets one Contribution Request by id, with Required and Preferred Requirements", async () => {
    const detail: ContributionRequestDetailDto = {
      id: "cr-1",
      projectId: "project-1",
      projectName: "sharek-backend",
      projectSlug: "sharek-backend",
      title: "Build a real-time notifications panel",
      technologyTags: ["React", "Node.js", "WebSocket"],
      difficulty: "intermediate",
      applicationsCloseAt: "2026-08-10T00:00:00.000Z",
      targetCompletionDate: "2026-08-20",
      reward: { amount: 120, currency: "USD" },
      description: "Ship an in-app notification panel with a live counter.",
      status: "published",
      attribution: {
        contributorId: "contributor-1",
        contributorName: "Sara Ahmed",
        contributorUsername: "sara",
      },
      requirements: [
        { id: "req-1", text: "React", classification: "required" },
        { id: "req-2", text: "WebSocket", classification: "preferred" },
      ],
    };
    mockedAxios.get.mockResolvedValueOnce({ data: detail });

    await expect(getContributionRequestById("cr-1")).resolves.toEqual(detail);
    expect(mockedAxios.get).toHaveBeenCalledWith("/tasks/cr-1");
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
    // Always present on the wire -- null for an ordinary draft, an object for
    // one generated from an accepted Proposal -- so the schema requires it
    // rather than treating a missing field as "no credit".
    attribution: null,
    publishedAt: null,
    createdAt: "2026-07-28T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
    ...overrides,
  };
}
