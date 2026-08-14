// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContributorContributionRequestDetailView } from "./contributor-contribution-request-detail-view";
import type { ApplicationDto } from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  applicationQuery: vi.fn(),
  submit: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}));

vi.mock("../api/queries/use-contribution-request-details-query", () => ({
  useContributionRequestDetailsQuery: mocks.query,
}));

vi.mock("../api/queries/use-application-query", () => ({
  useApplicationQuery: mocks.applicationQuery,
}));

vi.mock("../api/mutations/use-submit-application-mutation", () => ({
  useSubmitApplicationMutation: () => mocks.submit,
}));

describe("Contribution Request Application interactions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: makeRequest(),
    });
    mocks.applicationQuery.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Application status unavailable"),
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("preserves input and reuses the command key when a recoverable submission is retried", async () => {
    const submitted = makeApplication();
    const onApplicationSubmitted = vi.fn();
    mocks.submit.mutateAsync
      .mockRejectedValueOnce({ response: { status: 503 } })
      .mockResolvedValueOnce(submitted);

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={onApplicationSubmitted}
        />,
      );
    });

    const approach = container.querySelector<HTMLTextAreaElement>(
      "#contribution-approach",
    );
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(approach, "I will deliver the accessible workflow with tests.");
      approach?.dispatchEvent(new Event("input", { bubbles: true }));
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "احتفظنا بمدخلاتك",
    );
    expect(approach?.value).toContain("accessible workflow");

    await act(async () => {
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    const firstParams = mocks.submit.mutateAsync.mock.calls[0]?.[0].params;
    const secondParams = mocks.submit.mutateAsync.mock.calls[1]?.[0].params;
    expect(secondParams.idempotencyKey).toBe(firstParams.idempotencyKey);
    expect(onApplicationSubmitted).toHaveBeenCalledWith(submitted);
    expect(
      localStorage.getItem("sharek:application-status:request-1"),
    ).toBe("application-1");
  });

  it.each([
    ["APPLICATIONS_CLOSED", "أُغلق التقديم", "/tasks"],
    ["REQUEST_CANCELLED", "ألغى صاحب المشروع", "/tasks"],
    ["REQUEST_TERMINAL", "حالة نهائية", "/tasks"],
    ["APPLICATION_NOT_AUTHORIZED", "غير مخوّل", "/dashboard"],
    ["APPLICATION_IDEMPOTENCY_CONFLICT", "تعارضت محاولة", null],
  ])(
    "renders distinct recovery for %s at the feature seam",
    async (code, expected, recoveryHref) => {
      mocks.submit.mutateAsync.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            code,
            message: "Unstable backend copy",
          },
        },
      });
      await act(async () => {
        root.render(
          <ContributorContributionRequestDetailView
            requestId="request-1"
            requestsHref="/tasks"
            dashboardHref="/dashboard"
            applicationHref={(applicationId) =>
              `/applications/${applicationId}`
            }
            projectHref={(slug) => `/projects/${slug}`}
            onApplicationSubmitted={vi.fn()}
          />,
        );
      });

      await fillApproachAndSubmit();

      const alert = container.querySelector('[role="alert"]');
      expect(alert?.textContent).toContain(expected);
      expect(alert?.textContent).not.toContain("Unstable backend copy");
      expect(alert?.querySelector("a")?.getAttribute("href") ?? null).toBe(
        recoveryHref,
      );
      if (code === "APPLICATION_IDEMPOTENCY_CONFLICT") {
        expect(alert?.textContent).toContain("غيّر نهج المساهمة");
      }
    },
  );

  it("uses the delivered duplicate error without expecting unsupported metadata", async () => {
    mocks.submit.mutateAsync.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          code: "ALREADY_APPLIED",
          message: "Unstable backend copy",
        },
      },
    });
    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });

    await fillApproachAndSubmit();

    expect(container.querySelector("form")).not.toBeNull();
    expect(container.textContent).toContain("لديك طلب تقديم سابق");
    expect(container.textContent).not.toContain("Unstable backend copy");
  });

  it("recovers a remembered Application after session storage is cleared", async () => {
    localStorage.setItem(
      "sharek:application-status:request-1",
      "existing-1",
    );
    sessionStorage.clear();
    mocks.applicationQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...makeApplication(), id: "existing-1" },
    });

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });

    expect(container.querySelector("form")).toBeNull();
    expect(
      container.querySelector('a[href="/applications/existing-1"]'),
    ).not.toBeNull();
  });

  it("discards a remembered Application that is not authorized for this contributor", async () => {
    localStorage.setItem(
      "sharek:application-status:request-1",
      "another-contributor-application",
    );
    mocks.applicationQuery.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Application status unavailable"),
    });

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });

    expect(container.querySelector("form")).not.toBeNull();
    expect(
      localStorage.getItem("sharek:application-status:request-1"),
    ).toBeNull();
  });

  it("associates client validation with the invalid field and moves focus", async () => {
    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });
    const approach = container.querySelector<HTMLTextAreaElement>(
      "#contribution-approach",
    );
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(approach, "short");
      approach?.dispatchEvent(new Event("input", { bubbles: true }));
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(approach?.getAttribute("aria-invalid")).toBe("true");
    expect(approach?.getAttribute("aria-describedby")).toContain(
      "contribution-approach-error",
    );
    expect(document.activeElement).toBe(approach);
    expect(mocks.submit.mutateAsync).not.toHaveBeenCalled();
  });

  it("replaces the form with the final withdrawn status for a remembered Application", async () => {
    localStorage.setItem(
      "sharek:application-status:request-1",
      "application-1",
    );
    mocks.applicationQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...makeApplication(), status: "WITHDRAWN" },
    });

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });

    expect(container.querySelector("form")).toBeNull();
    expect(container.textContent).toContain("سحبت طلب التقديم");
    expect(container.textContent).toContain("لا يمكنك إرسال طلب تقديم جديد");
    expect(
      container.querySelector('a[href="/applications/application-1"]'),
    ).not.toBeNull();
    expect(mocks.submit.mutateAsync).not.toHaveBeenCalled();
  });

  it("renders the server's reset instant on a daily-limit refusal, never a computed one", async () => {
    const onApplicationQuotaChanged = vi.fn();
    mocks.submit.mutateAsync.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          code: "APPLICATION_DAILY_LIMIT_REACHED",
          message: "Unstable backend copy",
          metadata: {
            used: 1,
            limit: 1,
            resetsAt: "2026-08-15T00:00:00.000Z",
          },
        },
      },
    });

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
          applicationQuotaSlot={<p>quota slot</p>}
          onApplicationQuotaChanged={onApplicationQuotaChanged}
        />,
      );
    });

    await fillApproachAndSubmit();

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("استهلكت كل طلبات اليوم");
    // The exact instant the backend sent, formatted for the reader. A reset
    // time computed on this machine could disagree with the server's, and the
    // contributor would come back to another refusal (DEC-034).
    expect(alert?.textContent).toContain("15 أغسطس 2026");
    expect(alert?.textContent).not.toContain("Unstable backend copy");
    // Nothing relative, which is what a client-side computation would produce.
    expect(alert?.textContent).not.toContain("خلال");
    expect(alert?.textContent).toContain("احتفظنا بمسودّتك");
  });

  it("renders no reset sentence when the backend sent no resetsAt", async () => {
    mocks.submit.mutateAsync.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          code: "APPLICATION_DAILY_LIMIT_REACHED",
          message: "Unstable backend copy",
          metadata: { used: 1, limit: 1 },
        },
      },
    });

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
        />,
      );
    });

    await fillApproachAndSubmit();

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("استهلكت كل طلبات اليوم");
    // A guess would be worse than silence.
    expect(alert?.textContent).not.toContain("يتجدّد رصيدك");
  });

  it("shows the remaining count above the form and refreshes it after a submission", async () => {
    const onApplicationQuotaChanged = vi.fn();
    mocks.submit.mutateAsync.mockResolvedValueOnce(makeApplication());

    await act(async () => {
      root.render(
        <ContributorContributionRequestDetailView
          requestId="request-1"
          requestsHref="/tasks"
          dashboardHref="/dashboard"
          applicationHref={(applicationId) => `/applications/${applicationId}`}
          projectHref={(slug) => `/projects/${slug}`}
          onApplicationSubmitted={vi.fn()}
          applicationQuotaSlot={<p data-testid="quota">1 left today</p>}
          onApplicationQuotaChanged={onApplicationQuotaChanged}
        />,
      );
    });

    // Present before anything is typed, which is the point of the slot.
    const quota = container.querySelector("[data-testid='quota']");
    expect(quota?.textContent).toBe("1 left today");
    const form = container.querySelector("form");
    expect(quota && form && quota.compareDocumentPosition(form) &
      Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await fillApproachAndSubmit();

    // A created Application spent a slot, so the count is stale.
    expect(onApplicationQuotaChanged).toHaveBeenCalled();
  });

  async function fillApproachAndSubmit() {
    const approach = container.querySelector<HTMLTextAreaElement>(
      "#contribution-approach",
    );
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set?.call(approach, "I will deliver the accessible workflow with tests.");
      approach?.dispatchEvent(new Event("input", { bubbles: true }));
      container
        .querySelector("form")
        ?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  }
});

function makeRequest() {
  return {
    id: "request-1",
    projectId: "project-1",
    projectName: "Sharek Platform",
    projectSlug: "sharek-platform",
    title: "Build the notification center",
    description: "Deliver an accessible real-time notification center.",
    technologyTags: ["React"],
    difficulty: "intermediate" as const,
    applicationsCloseAt: "2030-08-10T12:00:00.000Z",
    targetCompletionDate: null,
    reward: null,
    status: "published" as const,
    attribution: null,
    requirements: [
      {
        id: "required-1",
        text: "Keyboard-accessible interactions",
        classification: "required" as const,
      },
    ],
  };
}

function makeApplication(): ApplicationDto {
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
    contributionApproach:
      "I will deliver the accessible workflow with tests.",
    proposedDeliveryDurationDays: 7,
    status: "PENDING_OWNER_REVIEW",
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
