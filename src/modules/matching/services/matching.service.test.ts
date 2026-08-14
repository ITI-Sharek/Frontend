import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { getRecommendedTasks } from "./matching.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("matching service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads contributor recommendations from the reverse matching seam", async () => {
    const response = {
      planType: "gold",
      recommendations: [],
      reason: null,
    } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getRecommendedTasks()).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contributors/me/recommended-tasks",
    );
  });

  it("passes the gated reason through as data rather than raising", async () => {
    // The backend answers a free contributor with 200 and a reason; the service
    // must not turn that into an error path.
    const response = {
      planType: "free",
      recommendations: [],
      reason: "MATCHING_REQUIRES_SUBSCRIPTION",
    } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getRecommendedTasks()).resolves.toEqual(response);
  });
});
