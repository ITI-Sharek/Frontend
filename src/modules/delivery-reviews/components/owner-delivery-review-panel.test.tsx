// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type {
  DeliveryClient,
  DeliveryDetailDto,
  DeliveryDto,
  DeliveryLifecycleDto,
  OwnerDeliveryReviewQueueDto,
  ReviewDeliveryCommand,
  SubmitDeliveryCommand,
} from "../types/delivery.types";
import { OwnerDeliveryReviewPanel } from "./owner-delivery-review-panel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const REQUEST_ID = "22222222-2222-4222-8222-222222222222";

describe("Owner delivery review panel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("requires a rating and records an explicit owner approval", async () => {
    const client = new OwnerMemoryDeliveryClient();
    await render(client);

    await waitFor(() => container.textContent.includes("مراجعة تسليم سارة أحمد"));
    expect(container.textContent).toContain("دعم قارئ الشاشة");
    expect(container.textContent).toContain("sharek/pull/42");

    const outcome = container.querySelector<HTMLSelectElement>(
      'select[name="outcome"]',
    );
    const rating = container.querySelector<HTMLSelectElement>(
      'select[name="rating"]',
    );
    expect(outcome).not.toBeNull();
    expect(rating).not.toBeNull();

    await act(async () => {
      setValue(outcome!, "APPROVED");
      setValue(rating!, "5");
    });
    await act(async () => findButton("اعتماد التسليم")?.click());

    expect(client.reviews).toHaveLength(1);
    expect(client.reviews[0]).toMatchObject({
      deliveryId: "44444444-4444-4444-8444-444444444444",
      outcome: "APPROVED",
      rating: 5,
    });
    expect(client.reviews[0]?.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(container.textContent).toContain("اكتمل طلب المساهمة");
  });

  it("blocks an incomplete review and requires feedback for requested changes", async () => {
    const client = new OwnerMemoryDeliveryClient();
    await render(client);
    await waitFor(() => container.textContent.includes("مراجعة تسليم سارة أحمد"));

    await act(async () => findButton("اعتماد التسليم")?.click());
    expect(client.reviews).toHaveLength(0);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "اختر تقييمًا",
    );

    const outcome = container.querySelector<HTMLSelectElement>(
      'select[name="outcome"]',
    );
    await act(async () => setValue(outcome!, "CHANGES_REQUESTED"));
    await act(async () => findButton("طلب تغييرات")?.click());
    expect(client.reviews).toHaveLength(0);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "اكتب ملاحظات واضحة",
    );

    const feedback = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="feedback"]',
    );
    await act(async () => setValue(feedback!, "أضف اختبار قارئ الشاشة."));
    await act(async () => findButton("طلب تغييرات")?.click());

    expect(client.reviews[0]).toMatchObject({
      outcome: "CHANGES_REQUESTED",
      feedback: "أضف اختبار قارئ الشاشة.",
    });
    expect(container.textContent).toContain("بانتظار إعادة إرسال المساهم");
  });

  it("requires feedback before recording a rejection", async () => {
    const client = new OwnerMemoryDeliveryClient();
    await render(client);
    await waitFor(() => container.textContent.includes("مراجعة تسليم سارة أحمد"));

    const outcome = container.querySelector<HTMLSelectElement>(
      'select[name="outcome"]',
    );
    await act(async () => setValue(outcome!, "REJECTED"));
    await act(async () => findButton("رفض التسليم")?.click());

    expect(client.reviews).toHaveLength(0);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "اكتب ملاحظات واضحة",
    );

    const feedback = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="feedback"]',
    );
    await act(async () => setValue(feedback!, "الرابط لا يحتوي على التنفيذ المطلوب."));
    await act(async () => findButton("رفض التسليم")?.click());

    expect(client.reviews[0]).toMatchObject({
      outcome: "REJECTED",
      feedback: "الرابط لا يحتوي على التنفيذ المطلوب.",
    });
    expect(container.textContent).toContain("تم رفض التسليم مع حفظ الملاحظات");
  });

  it("selects the accepted assignee when the request also has terminal applications", async () => {
    const client = new OwnerMemoryDeliveryClient();
    client.prependTerminalApplication = true;
    await render(client);

    await waitFor(() => container.textContent.includes("مراجعة تسليم سارة أحمد"));
    expect(container.textContent).not.toContain("بانتظار أن يرسل المساهم");
  });

  async function render(client: DeliveryClient) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <OwnerDeliveryReviewPanel requestId={REQUEST_ID} client={client} />
        </QueryClientProvider>,
      );
    });
  }

  function findButton(label: string) {
    return Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === label,
    );
  }
});

class OwnerMemoryDeliveryClient implements DeliveryClient {
  reviews: Array<ReviewDeliveryCommand & { deliveryId: string }> = [];
  prependTerminalApplication = false;
  private delivery: DeliveryDto = baseDelivery();

  async getOwnerLifecycle(): Promise<DeliveryLifecycleDto> {
    const acceptedContribution: DeliveryLifecycleDto["contributions"][number] = {
      applicationId: this.delivery.applicationId,
      contributionRequestId: REQUEST_ID,
      contributionRequestTitle: "تحسين تجربة التسليم",
      contributor: {
        id: this.delivery.contributorId,
        username: "sara",
        displayName: "سارة أحمد",
        avatarUrl: null,
      },
      applicationStatus: "ACCEPTED",
      deliveryDueAt: "2026-08-20T12:00:00.000Z",
      assignedAt: "2026-08-10T12:00:00.000Z",
      lifecycleStatus:
        this.delivery.status === "APPROVED"
          ? "COMPLETED"
          : this.delivery.status === "CHANGES_REQUESTED"
            ? "CHANGES_REQUESTED"
            : "DELIVERY_SUBMITTED",
      deliveryStatus: this.delivery.status,
      delivery: this.delivery,
    };
    return {
      contributions: this.prependTerminalApplication
        ? [
            {
              ...acceptedContribution,
              applicationId: "77777777-7777-4777-8777-777777777777",
              contributor: {
                ...acceptedContribution.contributor,
                id: "88888888-8888-4888-8888-888888888888",
                displayName: "مساهم آخر",
              },
              applicationStatus: "DECLINED_BY_OWNER",
              deliveryDueAt: null,
              assignedAt: null,
              lifecycleStatus: "DECLINED_BY_OWNER",
              deliveryStatus: null,
              delivery: null,
            },
            acceptedContribution,
          ]
        : [acceptedContribution],
    };
  }

  async getOwnerReviewQueue(): Promise<OwnerDeliveryReviewQueueDto> {
    return {
      deliveries:
        this.delivery.status === "SUBMITTED"
          ? [
              {
                ...this.delivery,
                contributor: {
                  id: this.delivery.contributorId,
                  username: "sara",
                  displayName: "سارة أحمد",
                  avatarUrl: null,
                },
                contributionRequest: {
                  id: REQUEST_ID,
                  title: "تحسين تجربة التسليم",
                  requirements: [
                    { kind: "required", position: 1, text: "دعم قارئ الشاشة" },
                  ],
                },
              },
            ]
          : [],
    };
  }

  async getDelivery(): Promise<DeliveryDetailDto> {
    return {
      ...this.delivery,
      contributor: {
        id: this.delivery.contributorId,
        username: "sara",
        displayName: "سارة أحمد",
        avatarUrl: null,
      },
      submissions: [
        {
          submissionNumber: 1,
          pullRequestUrl: this.delivery.pullRequestUrl,
          contributorNotes: "جاهز للمراجعة",
          submittedAt: this.delivery.submittedAt,
        },
      ],
      reviews: [],
    };
  }

  async reviewDelivery(
    deliveryId: string,
    command: ReviewDeliveryCommand,
  ): Promise<DeliveryDto> {
    this.reviews.push({ deliveryId, ...command });
    this.delivery = {
      ...this.delivery,
      status: command.outcome,
      reviewedAt: "2026-08-11T14:00:00.000Z",
    };
    return this.delivery;
  }

  async getContributorLifecycle(): Promise<never> {
    throw new Error("Not needed by this scenario");
  }

  async submitDelivery(
    _applicationId: string,
    _command: SubmitDeliveryCommand,
  ): Promise<never> {
    throw new Error("Not needed by this scenario");
  }

  async updateDelivery(
    _deliveryId: string,
    _command: SubmitDeliveryCommand,
  ): Promise<never> {
    throw new Error("Not needed by this scenario");
  }
}

function baseDelivery(): DeliveryDto {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    applicationId: "11111111-1111-4111-8111-111111111111",
    contributionRequestId: REQUEST_ID,
    contributorId: "33333333-3333-4333-8333-333333333333",
    pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/42",
    contributorNotes: "جاهز للمراجعة",
    status: "SUBMITTED",
    submittedAt: "2026-08-11T12:00:00.000Z",
    reviewedAt: null,
    submissionNumber: 1,
  };
}

function setValue(
  input: HTMLSelectElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLSelectElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitFor(predicate: () => boolean) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (predicate()) return;
    await act(async () => settle());
  }
  throw new Error("Timed out waiting for rendered state");
}
