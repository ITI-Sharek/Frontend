import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ApplicationStatusView } from "./application-status-view";
import { useApplicationQuery } from "../api/queries/use-application-query";
import { APPLICATION_STATUS_COPY } from "../constants/application-copy";
import type {
  ApplicationDto,
  ApplicationStatus,
} from "../types/application.types";

vi.mock("../api/queries/use-application-query", () => ({
  useApplicationQuery: vi.fn(),
}));

vi.mock("../api/mutations/use-withdraw-application-mutation", () => ({
  useWithdrawApplicationMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("contributor Application status", () => {
  it("confirms direct owner delivery and allows withdrawal only while pending", () => {
    vi.mocked(useApplicationQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: makeApplication("PENDING_OWNER_REVIEW"),
    } as unknown as ReturnType<typeof useApplicationQuery>);

    const html = renderToStaticMarkup(
      <ApplicationStatusView
        applicationId="application-1"
        requestHref={(requestId) => `/tasks/${requestId}`}
        requestsHref="/tasks"
      />,
    );

    expect(html).toContain("أُرسل طلب التقديم مباشرة إلى صاحب المشروع");
    expect(html).toContain("نهج المساهمة");
    expect(html).toContain("7 أيام");
    expect(html).toContain("سحب طلب التقديم");
    expect(html).not.toMatch(/فحص أهلية|قيد التحقق|محاولات/);
  });

  it.each(
    Object.keys(APPLICATION_STATUS_COPY) as ApplicationStatus[],
  )("explains the %s status distinctly", (status) => {
    vi.mocked(useApplicationQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: makeApplication(status),
    } as unknown as ReturnType<typeof useApplicationQuery>);

    const html = renderToStaticMarkup(
      <ApplicationStatusView
        applicationId="application-1"
        requestHref={(requestId) => `/tasks/${requestId}`}
        requestsHref="/tasks"
      />,
    );

    expect(html).toContain(APPLICATION_STATUS_COPY[status].label);
    expect(html).toContain(APPLICATION_STATUS_COPY[status].description);
    if (status !== "PENDING_OWNER_REVIEW") {
      expect(html).not.toContain("سحب طلب التقديم");
    }
  });
});

function makeApplication(status: ApplicationStatus): ApplicationDto {
  const accepted = status === "ACCEPTED";
  const declined = status === "DECLINED_BY_OWNER";
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
    status,
    requirementSnapshot: {
      required: [
        { id: "required-1", position: 0, text: "Accessible interactions" },
      ],
      preferred: [],
    },
    evidenceSummary: [],
    submittedAt: "2026-07-30T15:00:00.000Z",
    reviewDueAt: "2026-08-06T15:00:00.000Z",
    expiresAt: "2026-08-06T15:00:00.000Z",
    expiredAt: status === "EXPIRED" ? "2026-08-06T15:00:00.000Z" : null,
    overdue: false,
    ownerDecision:
      accepted || declined
        ? {
            id: "decision-1",
            applicationId: "application-1",
            contributionRequestId: "request-1",
            decisionType: accepted ? "ACCEPTED" : "DECLINED",
            feedback: declined ? "The approach does not cover testing." : null,
            decidedAt: "2026-08-01T10:00:00.000Z",
          }
        : null,
    assignment: accepted
      ? {
          id: "assignment-1",
          contributionRequestId: "request-1",
          applicationId: "application-1",
          ownerDecisionId: "decision-1",
          contributorId: "contributor-1",
          agreedDeliveryDurationDays: 7,
          agreedDeliveryDueDate: "2026-08-08T10:00:00.000Z",
          assignedAt: "2026-08-01T10:00:00.000Z",
        }
      : null,
  };
}
