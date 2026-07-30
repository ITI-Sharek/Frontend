import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationStatusView } from "./application-status-view";
import { APPLICATION_STATUS_COPY } from "../constants/application-copy";
import type {
  ApplicationDto,
  ApplicationStatus,
} from "../types/application.types";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  report: { isPending: false, mutateAsync: vi.fn() },
  withdraw: { isPending: false, mutateAsync: vi.fn() },
}));

vi.mock("../api/queries/use-application-query", () => ({
  useApplicationQuery: mocks.query,
}));

vi.mock("../api/mutations/use-report-decision-feedback-mutation", () => ({
  useReportDecisionFeedbackMutation: () => mocks.report,
}));

vi.mock("../api/mutations/use-withdraw-application-mutation", () => ({
  useWithdrawApplicationMutation: () => mocks.withdraw,
}));

describe("contributor Application status", () => {
  beforeEach(() => vi.clearAllMocks());

  it("confirms direct owner delivery and allows withdrawal only while pending", () => {
    mocks.query.mockReturnValue(queryResult(application("PENDING_OWNER_REVIEW")));

    const html = render();

    expect(html).toContain("أُرسل طلب التقديم مباشرة إلى صاحب المشروع");
    expect(html).toContain("نهج المساهمة");
    expect(html).toContain("5 يوم");
    expect(html).toContain("سحب طلب التقديم");
    expect(html).not.toMatch(/فحص أهلية|قيد التحقق|محاولات/);
  });

  it.each(
    Object.keys(APPLICATION_STATUS_COPY) as ApplicationStatus[],
  )("explains %s as a distinct contributor outcome", (status) => {
    mocks.query.mockReturnValue(queryResult(application(status)));

    const html = render();

    expect(html).toContain(APPLICATION_STATUS_COPY[status].label);
    expect(html).toContain(APPLICATION_STATUS_COPY[status].description);
    if (status !== "PENDING_OWNER_REVIEW") {
      expect(html).not.toContain("سحب طلب التقديم");
    }
  });

  it.each([
    "DECLINED_BY_OWNER",
    "NOT_SELECTED",
    "EXPIRED",
    "WITHDRAWN",
    "REQUEST_CANCELLED",
  ] as const)("explains %s as a neutral outcome", (status) => {
    mocks.query.mockReturnValue(queryResult(application(status)));

    const html = render();
    expect(html).toMatch(/لا (?:ي|ت)ؤثر/);
    expect(html).not.toMatch(
      /غير مؤهل|ناجح|راسب|نسبة المطابقة|درجة المطابقة|المرتبة/,
    );
  });

  it("shows the accepted Assignment and agreed delivery date", () => {
    mocks.query.mockReturnValue(queryResult(application("ACCEPTED")));

    const html = render();
    expect(html).toContain("إسناد العمل");
    expect(html).toContain("مدة التسليم المتفق عليها");
    expect(html).toContain("موعد التسليم المتفق عليه");
  });

  it("keeps human decline feedback separate and reporting is not an appeal", () => {
    mocks.query.mockReturnValue(queryResult(application("DECLINED_BY_OWNER")));

    const html = render();
    expect(html).toContain("ملاحظات بشرية مرتبطة بقرار المالك");
    expect(html).toContain("البلاغ ليس استئنافًا");
    expect(html).toContain("الإبلاغ عن الملاحظات");
  });

  it("renders an actionable loading failure", () => {
    mocks.query.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("offline"),
      refetch: vi.fn(),
    });

    const html = render();
    expect(html).toContain("تعذر فتح طلب التقديم");
    expect(html).toContain("إعادة المحاولة");
  });
});

function render() {
  return renderToStaticMarkup(
    <ApplicationStatusView
      applicationId="application-1"
      requestHref={(requestId) => `/tasks/${requestId}`}
      requestsHref="/tasks"
    />,
  );
}

function queryResult(data: ApplicationDto) {
  return {
    isPending: false,
    isError: false,
    data,
    refetch: vi.fn(),
  };
}

function application(status: ApplicationStatus): ApplicationDto {
  const declined = status === "DECLINED_BY_OWNER";
  const accepted = status === "ACCEPTED";
  const ownerDecision =
    declined || accepted
      ? {
          id: "decision-1",
          applicationId: "application-1",
          contributionRequestId: "request-1",
          decisionType: accepted ? ("ACCEPTED" as const) : ("DECLINED" as const),
          feedback: declined ? "نحتاج خطة اختبار أوضح." : null,
          decidedAt: "2026-07-30T12:00:00.000Z",
        }
      : null;
  const assignment = accepted
    ? {
        id: "assignment-1",
        contributionRequestId: "request-1",
        applicationId: "application-1",
        ownerDecisionId: "decision-1",
        contributorId: "user-1",
        agreedDeliveryDurationDays: 5,
        agreedDeliveryDueDate: "2026-08-04T12:00:00.000Z",
        assignedAt: "2026-07-30T12:00:00.000Z",
      }
    : null;

  return {
    id: "application-1",
    contributionRequestId: "request-1",
    contributor: { id: "user-1", username: "sara", displayName: "سارة" },
    profileContext: {
      bio: null,
      availability: null,
      experienceLevel: null,
      fields: [],
      declaredSkills: [],
    },
    contributionApproach: "سأنفذ التدفق مع اختبارات.",
    proposedDeliveryDurationDays: 5,
    status,
    requirementSnapshot: { required: [], preferred: [] },
    evidenceSummary: [],
    submittedAt: "2026-07-28T10:00:00.000Z",
    reviewDueAt: "2026-07-31T10:00:00.000Z",
    expiresAt: "2026-08-04T10:00:00.000Z",
    expiredAt:
      status === "EXPIRED" ? "2026-08-04T10:00:00.000Z" : null,
    overdue: false,
    ownerDecision,
    assignment,
  };
}
