import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  generateOwnerMatches,
  getRecommendedTasks,
  getOwnerMatches,
  inviteMatchedContributor,
} from "./matching.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("matching service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads owner-scoped matches without reconstructing plan policy", async () => {
    const response = {
      requestId: "request-1",
      planType: "silver",
      resultLimit: 5,
      status: "completed",
      matches: [],
    } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getOwnerMatches("request 1")).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contribution-requests/request%201/matches",
    );
  });

  it("uses explicit generation and invitation command seams", async () => {
    mockedAxios.post
      .mockResolvedValueOnce({ data: { requestId: "request-1", status: "completed" } })
      .mockResolvedValueOnce({
        data: {
          requestId: "request-1",
          contributorId: "contributor-1",
          notificationId: "notification-1",
          created: true,
        },
      });

    await generateOwnerMatches("request-1");
    await inviteMatchedContributor("request-1", "contributor 1");

    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      "/contribution-requests/request-1/matches/generate",
    );
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "/contribution-requests/request-1/matches/contributor%201/invite",
    );
  });

  it("loads Gold contributor recommendations from the reverse matching seam", async () => {
    const response = { planType: "gold", recommendations: [] } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getRecommendedTasks()).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contributors/me/recommended-tasks",
    );
  });
});
