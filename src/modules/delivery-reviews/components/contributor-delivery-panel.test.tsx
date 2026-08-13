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
  SubmitDeliveryCommand,
} from "../types/delivery.types";
import { ContributorDeliveryPanel } from "./contributor-delivery-panel";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const APPLICATION_ID = "11111111-1111-4111-8111-111111111111";

describe("Contributor delivery panel", () => {
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

  it("submits a canonical pull-request URL and shows the confirmed state", async () => {
    const client = new MemoryDeliveryClient();
    await render(client);

    expect(container.textContent).toContain("تسليم العمل");

    const pullRequestInput = container.querySelector<HTMLInputElement>(
      'input[name="pullRequestUrl"]',
    );
    const notesInput = container.querySelector<HTMLTextAreaElement>(
      'textarea[name="contributorNotes"]',
    );
    expect(pullRequestInput).not.toBeNull();
    expect(notesInput).not.toBeNull();

    await act(async () => {
      setValue(
        pullRequestInput!,
        "https://github.com/sharek-platform/sharek/pull/42",
      );
      setValue(notesInput!, "أضفت الاختبارات وتعليمات التحقق.");
    });
    await act(async () => findButton("إرسال التسليم")?.click());

    expect(client.submissions).toHaveLength(1);
    expect(client.submissions[0]).toMatchObject({
      applicationId: APPLICATION_ID,
      pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/42",
      contributorNotes: "أضفت الاختبارات وتعليمات التحقق.",
    });
    expect(client.submissions[0]?.idempotencyKey).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    expect(container.textContent).toContain("بانتظار مراجعة صاحب المشروع");
    expect(container.textContent).toContain("الإرسال رقم 1");
  });

  it("shows requested changes and resubmits as a new immutable version", async () => {
    const client = new MemoryDeliveryClient(changesRequestedDelivery());
    await render(client);

    await waitFor(() =>
      container.textContent.includes("أضف اختبار قارئ الشاشة قبل الدمج."),
    );
    expect(container.textContent).toContain("سجل التسليم والمراجعة");
    expect(container.textContent).toContain("الإرسال رقم 1");

    const pullRequestInput = container.querySelector<HTMLInputElement>(
      'input[name="pullRequestUrl"]',
    );
    expect(pullRequestInput?.value).toBe(
      "https://github.com/sharek-platform/sharek/pull/42",
    );

    await act(async () => {
      setValue(
        pullRequestInput!,
        "https://github.com/sharek-platform/sharek/pull/43",
      );
    });
    await act(async () => findButton("إعادة إرسال التسليم")?.click());

    expect(client.updates).toHaveLength(1);
    expect(client.updates[0]).toMatchObject({
      deliveryId: "44444444-4444-4444-8444-444444444444",
      pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/43",
    });
    expect(container.textContent).toContain("بانتظار مراجعة صاحب المشروع");
    expect(container.textContent).toContain("الإرسال رقم 2");
  });

  it("lets the contributor correct a submitted PR link before owner review", async () => {
    const client = new MemoryDeliveryClient(submittedDelivery());
    await render(client);

    await act(async () => findButton("تعديل رابط التسليم")?.click());
    const pullRequestInput = container.querySelector<HTMLInputElement>(
      'input[name="pullRequestUrl"]',
    );
    expect(pullRequestInput?.value).toBe(
      "https://github.com/sharek-platform/sharek/pull/42",
    );

    await act(async () =>
      setValue(
        pullRequestInput!,
        "https://github.com/sharek-platform/sharek/pull/44",
      ),
    );
    await act(async () => findButton("حفظ رابط التسليم")?.click());

    expect(client.updates[0]).toMatchObject({
      pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/44",
    });
    expect(container.textContent).toContain("بانتظار مراجعة صاحب المشروع");
    expect(container.textContent).toContain("الإرسال رقم 2");
  });

  it("rejects non-GitHub PR URLs and reuses the command key on retry", async () => {
    const client = new MemoryDeliveryClient();
    client.submissionFailuresRemaining = 1;
    await render(client);

    const pullRequestInput = container.querySelector<HTMLInputElement>(
      'input[name="pullRequestUrl"]',
    );
    await act(async () => setValue(pullRequestInput!, "https://gitlab.com/team/repo/merge_requests/1"));
    await act(async () => findButton("إرسال التسليم")?.click());
    expect(client.submissions).toHaveLength(0);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "رابط Pull Request صالحًا من GitHub",
    );

    await act(async () =>
      setValue(
        pullRequestInput!,
        "https://github.com/sharek-platform/sharek/pull/42",
      ),
    );
    await act(async () => findButton("إرسال التسليم")?.click());
    await waitFor(() =>
      Boolean(container.querySelector('[role="alert"]')?.textContent.includes("تعذر إرسال")),
    );
    await act(async () => findButton("إرسال التسليم")?.click());

    expect(client.submissions).toHaveLength(2);
    expect(client.submissions[1]?.idempotencyKey).toBe(
      client.submissions[0]?.idempotencyKey,
    );
  });

  it("shows the owner's final rating and feedback as review evidence", async () => {
    const client = new MemoryDeliveryClient({
      ...changesRequestedDelivery(),
      status: "APPROVED",
      reviewedAt: "2026-08-11T14:00:00.000Z",
    });
    await render(client);

    await waitFor(() => container.textContent.includes("5 من 5"));
    expect(container.textContent).toContain("اعتمد صاحب المشروع التسليم");
    expect(container.textContent).toContain("تنفيذ متقن واختبارات واضحة.");
  });

  async function render(client: DeliveryClient) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <ContributorDeliveryPanel
            applicationId={APPLICATION_ID}
            client={client}
          />
        </QueryClientProvider>,
      );
    });
    await waitFor(() => container.textContent.includes("تسليم العمل"));
  }

  function findButton(label: string) {
    return Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === label,
    );
  }
});

class MemoryDeliveryClient implements DeliveryClient {
  submissions: Array<SubmitDeliveryCommand & { applicationId: string }> = [];
  updates: Array<SubmitDeliveryCommand & { deliveryId: string }> = [];
  submissionFailuresRemaining = 0;
  private delivery: DeliveryDto | null;

  constructor(delivery: DeliveryDto | null = null) {
    this.delivery = delivery;
  }

  async getContributorLifecycle(): Promise<DeliveryLifecycleDto> {
    return {
      contributions: [
        {
          applicationId: APPLICATION_ID,
          contributionRequestId: "22222222-2222-4222-8222-222222222222",
          contributionRequestTitle: "تحسين تجربة التسليم",
          contributor: {
            id: "33333333-3333-4333-8333-333333333333",
            username: "sara",
            displayName: "سارة أحمد",
            avatarUrl: null,
          },
          applicationStatus: "ACCEPTED",
          deliveryDueAt: "2026-08-20T12:00:00.000Z",
          assignedAt: "2026-08-10T12:00:00.000Z",
          lifecycleStatus: this.delivery
            ? "DELIVERY_SUBMITTED"
            : "AWAITING_DELIVERY",
          deliveryStatus: this.delivery?.status ?? "NOT_STARTED",
          delivery: this.delivery,
        },
      ],
    };
  }

  async submitDelivery(
    applicationId: string,
    command: SubmitDeliveryCommand,
  ): Promise<DeliveryDto> {
    this.submissions.push({ applicationId, ...command });
    if (this.submissionFailuresRemaining > 0) {
      this.submissionFailuresRemaining -= 1;
      throw new Error("Temporary failure");
    }
    this.delivery = {
      id: "44444444-4444-4444-8444-444444444444",
      applicationId,
      contributionRequestId: "22222222-2222-4222-8222-222222222222",
      contributorId: "33333333-3333-4333-8333-333333333333",
      pullRequestUrl: command.pullRequestUrl,
      contributorNotes: command.contributorNotes || null,
      status: "SUBMITTED",
      submittedAt: "2026-08-11T12:00:00.000Z",
      reviewedAt: null,
      submissionNumber: 1,
    };
    return this.delivery;
  }

  async getDelivery(): Promise<DeliveryDetailDto> {
    if (!this.delivery) throw new Error("Delivery is missing");
    return {
      ...this.delivery,
      contributor: {
        id: "33333333-3333-4333-8333-333333333333",
        username: "sara",
        displayName: "سارة أحمد",
        avatarUrl: null,
      },
      submissions: [
        {
          submissionNumber: 1,
          pullRequestUrl:
            "https://github.com/sharek-platform/sharek/pull/42",
          contributorNotes: "النسخة الأولى",
          submittedAt: "2026-08-11T12:00:00.000Z",
        },
      ],
      reviews: deliveryReviews(this.delivery.status),
    };
  }

  async getOwnerLifecycle(): Promise<never> {
    throw new Error("Not needed by this scenario");
  }

  async getOwnerReviewQueue(): Promise<never> {
    throw new Error("Not needed by this scenario");
  }

  async updateDelivery(
    deliveryId: string,
    command: SubmitDeliveryCommand,
  ): Promise<DeliveryDto> {
    if (!this.delivery) throw new Error("Delivery is missing");
    this.updates.push({ deliveryId, ...command });
    const status =
      this.delivery.status === "CHANGES_REQUESTED"
        ? "RESUBMITTED"
        : "SUBMITTED";
    this.delivery = {
      ...this.delivery,
      pullRequestUrl: command.pullRequestUrl,
      contributorNotes: command.contributorNotes || null,
      status,
      submittedAt: "2026-08-11T15:00:00.000Z",
      reviewedAt: null,
      submissionNumber: 2,
    };
    return this.delivery;
  }

  async reviewDelivery(): Promise<never> {
    throw new Error("Not needed by this scenario");
  }
}

function deliveryReviews(status: DeliveryDto["status"]): DeliveryDetailDto["reviews"] {
  if (status === "CHANGES_REQUESTED") {
    return [
      {
        id: "55555555-5555-4555-8555-555555555555",
        submissionNumber: 1,
        reviewerId: "66666666-6666-4666-8666-666666666666",
        outcome: "CHANGES_REQUESTED",
        rating: null,
        feedback: "أضف اختبار قارئ الشاشة قبل الدمج.",
        createdAt: "2026-08-11T14:00:00.000Z",
      },
    ];
  }
  if (status === "APPROVED") {
    return [
      {
        id: "55555555-5555-4555-8555-555555555555",
        submissionNumber: 1,
        reviewerId: "66666666-6666-4666-8666-666666666666",
        outcome: "APPROVED",
        rating: 5,
        feedback: "تنفيذ متقن واختبارات واضحة.",
        createdAt: "2026-08-11T14:00:00.000Z",
      },
    ];
  }
  return [];
}

function changesRequestedDelivery(): DeliveryDto {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    applicationId: APPLICATION_ID,
    contributionRequestId: "22222222-2222-4222-8222-222222222222",
    contributorId: "33333333-3333-4333-8333-333333333333",
    pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/42",
    contributorNotes: "النسخة الأولى",
    status: "CHANGES_REQUESTED",
    submittedAt: "2026-08-11T12:00:00.000Z",
    reviewedAt: "2026-08-11T14:00:00.000Z",
    submissionNumber: 1,
  };
}

function submittedDelivery(): DeliveryDto {
  return {
    ...changesRequestedDelivery(),
    status: "SUBMITTED",
    reviewedAt: null,
  };
}

function setValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
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
