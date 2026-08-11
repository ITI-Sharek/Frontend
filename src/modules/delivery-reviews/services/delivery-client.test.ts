import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const { axiosInstance } = await import("@/lib/axios/axios-instance");
const { httpDeliveryClient } = await import("./delivery-client");
const mockedAxios = vi.mocked(axiosInstance);

describe("HTTP delivery client", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads contributor and owner lifecycle projections through their role endpoints", async () => {
    mockedAxios.get.mockResolvedValue({ data: { contributions: [] } });

    await httpDeliveryClient.getContributorLifecycle();
    await httpDeliveryClient.getOwnerLifecycle();
    await httpDeliveryClient.getOwnerReviewQueue();
    await httpDeliveryClient.getDelivery("delivery/1");

    expect(mockedAxios.get).toHaveBeenNthCalledWith(1, "/me/deliveries");
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2,
      "/owner/delivery-lifecycle",
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(3, "/owner/deliveries");
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      4,
      "/deliveries/delivery%2F1",
    );
  });

  it("submits and resubmits evidence with an idempotency header", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "delivery-1" } });
    mockedAxios.patch.mockResolvedValue({ data: { id: "delivery-1" } });
    const command = {
      pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/42",
      contributorNotes: "Ready",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
    };

    await httpDeliveryClient.submitDelivery("application/1", command);
    await httpDeliveryClient.updateDelivery("delivery/1", command);

    const body = {
      pullRequestUrl: command.pullRequestUrl,
      contributorNotes: command.contributorNotes,
    };
    const config = {
      headers: { "Idempotency-Key": command.idempotencyKey },
    };
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/applications/application%2F1/deliveries",
      body,
      config,
    );
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/deliveries/delivery%2F1",
      body,
      config,
    );
  });

  it("keeps the review key in the header rather than the request body", async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: "delivery-1" } });

    await httpDeliveryClient.reviewDelivery("delivery-1", {
      outcome: "APPROVED",
      rating: 5,
      feedback: "Strong delivery",
      idempotencyKey: "22222222-2222-4222-8222-222222222222",
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/deliveries/delivery-1/reviews",
      {
        outcome: "APPROVED",
        rating: 5,
        feedback: "Strong delivery",
      },
      {
        headers: {
          "Idempotency-Key": "22222222-2222-4222-8222-222222222222",
        },
      },
    );
  });
});
