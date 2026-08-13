// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationStatusView } from "./application-status-view";
import type { ApplicationDto } from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  withdraw: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  report: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}));

vi.mock("../api/queries/use-application-query", () => ({
  useApplicationQuery: mocks.query,
}));

vi.mock("../api/mutations/use-withdraw-application-mutation", () => ({
  useWithdrawApplicationMutation: () => mocks.withdraw,
}));

vi.mock("../api/mutations/use-report-decision-feedback-mutation", () => ({
  useReportDecisionFeedbackMutation: () => mocks.report,
}));

describe("Application withdrawal interaction", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: makePendingApplication(),
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("requires confirmation and reuses the withdrawal key on retry", async () => {
    mocks.withdraw.mutateAsync.mockRejectedValue({ response: { status: 503 } });
    await act(async () => {
      root.render(
        <ApplicationStatusView
          applicationId="application-1"
          requestHref={(requestId) => `/tasks/${requestId}`}
          requestsHref="/tasks"
        />,
      );
    });

    await act(async () => {
      findButton("سحب طلب التقديم")?.click();
    });
    expect(container.querySelector('[role="group"]')).not.toBeNull();
    expect(document.activeElement?.id).toBe("withdrawal-confirm");

    await act(async () => {
      findButton("تأكيد السحب")?.click();
    });
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "تعذر سحب",
    );

    await act(async () => {
      findButton("تأكيد السحب")?.click();
    });

    const first = mocks.withdraw.mutateAsync.mock.calls[0]?.[0];
    const second = mocks.withdraw.mutateAsync.mock.calls[1]?.[0];
    expect(second.idempotencyKey).toBe(first.idempotencyKey);

    await act(async () => {
      findButton("إلغاء")?.click();
    });
    expect(container.querySelector('[role="group"]')).toBeNull();
    expect(document.activeElement?.id).toBe("withdrawal-trigger");
  });

  it("renders the server-confirmed WITHDRAWN transition and removes the action", async () => {
    let application: ApplicationDto = makePendingApplication();
    mocks.query.mockImplementation(() => ({
      isPending: false,
      isError: false,
      data: application,
    }));
    mocks.withdraw.mutateAsync.mockImplementation(async () => {
      application = { ...application, status: "WITHDRAWN" as const };
      return application;
    });

    await act(async () => {
      root.render(
        <ApplicationStatusView
          applicationId="application-1"
          requestHref={(requestId) => `/tasks/${requestId}`}
          requestsHref="/tasks"
        />,
      );
    });
    await act(async () => {
      findButton("سحب طلب التقديم")?.click();
    });
    await act(async () => {
      findButton("تأكيد السحب")?.click();
    });
    await act(async () => {
      root.render(
        <ApplicationStatusView
          applicationId="application-1"
          requestHref={(requestId) => `/tasks/${requestId}`}
          requestsHref="/tasks"
        />,
      );
    });

    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "سحبت طلب التقديم",
    );
    expect(findButton("سحب طلب التقديم")).toBeUndefined();
  });

  function findButton(label: string) {
    return Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.trim() === label,
    );
  }
});

function makePendingApplication() {
  return {
    id: "application-1",
    contributionRequestId: "request-1",
    contributor: {
      id: "contributor-1",
      username: "sara",
      displayName: "Sara Ahmed",
    },
    profileContext: {
      bio: null,
      availability: null,
      experienceLevel: null,
      fields: [],
      declaredSkills: [],
    },
    contributionApproach: "I will deliver the accessible workflow with tests.",
    proposedDeliveryDurationDays: 7,
    status: "PENDING_OWNER_REVIEW" as const,
    requirementSnapshot: { required: [], preferred: [] },
    evidenceSummary: [],
    submittedAt: "2026-07-30T15:00:00.000Z",
    reviewDueAt: "2026-08-06T15:00:00.000Z",
    expiresAt: "2026-08-06T15:00:00.000Z",
    expiredAt: null,
    overdue: false,
    ownerDecision: null,
    assignment: null,
  };
}
