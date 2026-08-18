import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  createSubscriptionCheckout,
  getPaymentStatus,
  getSubscriptionStatus,
} from "./subscriptions.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: { get: vi.fn(), post: vi.fn() },
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

  it("starts a checkout with the same idempotency key in the body and header", async () => {
    const payload = {
      planType: "gold",
      roleContext: "owner",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
    } as const;
    const response = {
      paymentId: "33333333-3333-4333-8333-333333333333",
      checkout: {
        provider: "paymob",
        clientSecret: "browser-safe-secret",
        checkoutUrl: "https://accept.paymobsolutions.com/unifiedcheckout/abc",
      },
    } as const;
    mockedAxios.post.mockResolvedValueOnce({ data: response });

    await expect(createSubscriptionCheckout(payload)).resolves.toEqual(response);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/me/subscription/checkout",
      payload,
      { headers: { "Idempotency-Key": payload.idempotencyKey } },
    );
  });

  it("reads payment status by an encoded payment id", async () => {
    const response = {
      paymentId: "33333333-3333-4333-8333-333333333333",
      planType: "gold",
      roleContext: "contributor",
      amountCents: 50000,
      currency: "EGP",
      status: "pending",
      createdAt: "2026-08-18T00:00:00.000Z",
      paidAt: null,
    } as const;
    mockedAxios.get.mockResolvedValueOnce({ data: response });

    await expect(getPaymentStatus(response.paymentId)).resolves.toEqual(response);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `/me/payments/${response.paymentId}`,
    );
  });
});
