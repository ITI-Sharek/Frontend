// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import type { ReactNode } from "react";
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
import { ContributorDeliveryLifecycleSection } from "./contributor-delivery-lifecycle-section";
import { OwnerDeliveryInbox } from "./owner-delivery-inbox";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Sprint 5 delivery dashboard sections", () => {
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

  it("shows each contributor lifecycle state with an application deep link", async () => {
    await render(<ContributorDeliveryLifecycleSection client={client} />);
    await waitFor(() => container.textContent.includes("التسليم بانتظار المراجعة"));

    expect(container.textContent).toContain("تحسين تجربة التسليم");
    expect(container.querySelector('a[href="/applications/application-1"]')).not.toBeNull();
  });

  it("highlights owner deliveries that need review and links to the request", async () => {
    await render(<OwnerDeliveryInbox client={client} />);
    await waitFor(() => container.textContent.includes("1 تحتاج مراجعتك"));

    expect(container.textContent).toContain("مراجعة التسليم");
    expect(container.textContent).toContain("سارة أحمد");
    expect(container.querySelector('a[href="/contribution-requests/request-1"]')).not.toBeNull();
  });

  async function render(view: ReactNode) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await act(async () => {
      root.render(<QueryClientProvider client={queryClient}>{view}</QueryClientProvider>);
    });
  }
});

const delivery: DeliveryDto = {
  id: "delivery-1",
  applicationId: "application-1",
  contributionRequestId: "request-1",
  contributorId: "contributor-1",
  pullRequestUrl: "https://github.com/sharek-platform/sharek/pull/42",
  contributorNotes: "جاهز للمراجعة",
  status: "SUBMITTED",
  submittedAt: "2026-08-11T12:00:00.000Z",
  reviewedAt: null,
  submissionNumber: 1,
};

const lifecycle: DeliveryLifecycleDto = {
  contributions: [
    {
      applicationId: delivery.applicationId,
      contributionRequestId: delivery.contributionRequestId,
      contributionRequestTitle: "تحسين تجربة التسليم",
      contributor: {
        id: delivery.contributorId,
        username: "sara",
        displayName: "سارة أحمد",
        avatarUrl: null,
      },
      applicationStatus: "ACCEPTED",
      deliveryDueAt: "2026-08-20T12:00:00.000Z",
      assignedAt: "2026-08-10T12:00:00.000Z",
      lifecycleStatus: "DELIVERY_SUBMITTED",
      deliveryStatus: "SUBMITTED",
      delivery,
    },
  ],
};

const client: DeliveryClient = {
  getContributorLifecycle: async () => lifecycle,
  getOwnerLifecycle: async () => lifecycle,
  getOwnerReviewQueue: async (): Promise<OwnerDeliveryReviewQueueDto> => ({
    deliveries: [
      {
        ...delivery,
        contributor: lifecycle.contributions[0].contributor,
        contributionRequest: {
          id: delivery.contributionRequestId,
          title: "تحسين تجربة التسليم",
          requirements: [],
        },
      },
    ],
  }),
  getDelivery: async (): Promise<DeliveryDetailDto> => {
    throw new Error("Not used");
  },
  submitDelivery: async (
    _applicationId: string,
    _command: SubmitDeliveryCommand,
  ): Promise<DeliveryDto> => {
    throw new Error("Not used");
  },
  updateDelivery: async (
    _deliveryId: string,
    _command: SubmitDeliveryCommand,
  ): Promise<DeliveryDto> => {
    throw new Error("Not used");
  },
  reviewDelivery: async (
    _deliveryId: string,
    _command: ReviewDeliveryCommand,
  ): Promise<DeliveryDto> => {
    throw new Error("Not used");
  },
};

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
