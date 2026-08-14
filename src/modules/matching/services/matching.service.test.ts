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
    const response = { planType: "gold", recommendations: [] } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getRecommendedTasks()).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/contributors/me/recommended-tasks",
    );
  });
});
