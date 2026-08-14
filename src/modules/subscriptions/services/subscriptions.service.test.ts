import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import { getSubscriptionStatus } from "./subscriptions.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn() },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("subscriptions service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the authenticated role-context plan from the backend seam", async () => {
    const response = {
      roleContext: "owner",
      plan: "free",
      status: "active",
      source: "admin",
      usage: {
        used: 8,
        limit: 20,
        periodStart: "2026-08-01T00:00:00.000Z",
        periodEnd: "2026-09-01T00:00:00.000Z",
      },
      benefits: [
        {
          key: "owner_contribution_request_limit",
          state: "included",
          label: "Up to 20 Contribution Requests per calendar month",
        },
      ],
      entitlements: [
        { key: "PROJECT_MATERIAL_ANALYSIS", state: "unavailable" },
      ],
    } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getSubscriptionStatus()).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith("/me/subscription");
  });
});
