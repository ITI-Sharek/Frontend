// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdvisoryFitAssessment } from "./advisory-fit-assessment";
import type { ApplicationDto } from "../types/application.types";
import type { AdvisoryFitAssessmentDto } from "../types/advisory-fit.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  request: { isPending: false, mutateAsync: vi.fn() },
}));

vi.mock("../api/queries/use-advisory-fit-query", () => ({
  useAdvisoryFitQuery: mocks.query,
}));

vi.mock("../api/mutations/use-request-advisory-fit-mutation", () => ({
  useRequestAdvisoryFitMutation: () => mocks.request,
}));

vi.mock("@/shared/utils/idempotency-key", () => ({
  createIdempotencyKey: () => "assessment-idempotency-key",
}));

describe("owner Advisory Fit presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockReturnValue(queryResult(assessment("NOT_REQUESTED")));
  });

  it("offers an explicit assessment request without making it a decision gate", () => {
    const html = render();

    expect(html).toContain("طلب تقييم استشاري");
    expect(html).toContain("اختياري");
    expect(html).not.toMatch(/مؤهل|غير مؤهل|نسبة|ترتيب|توصية/);
  });

  it("presents completed Required and Preferred findings with confidence and evidence", () => {
    mocks.query.mockReturnValue(queryResult(assessment("COMPLETED")));

    const html = render();

    expect(html).toContain("قوي");
    expect(html).toContain("المتطلبات المطلوبة");
    expect(html).toContain("المتطلبات المفضلة");
    expect(html).toContain("الثقة: عالية");
    expect(html).toContain("معرّفات الأدلة");
    expect(html).toContain("عدم اليقين");
    expect(html).not.toMatch(/درجة|نسبة|أهلية|ترتيب|توصية/);
  });

  it("keeps a requested assessment visibly pending and refreshable", () => {
    const refetch = vi.fn();
    mocks.query.mockReturnValue({
      ...queryResult(assessment("REQUESTED")),
      refetch,
    });

    const html = render();

    expect(html).toContain("قيد المعالجة");
    expect(html).toContain("تحديث الحالة");
  });

  it.each([
    ["NOT_STARTED_NO_ASSESSABLE_EVIDENCE", "لا توجد أدلة قابلة للتقييم"],
    ["NOT_STARTED_SYSTEM_LIMIT", "حد تقني مؤقت"],
    ["UNAVAILABLE", "لم يكتمل تقييم صالح"],
  ] as const)("keeps %s decision-neutral", (status, expectedCopy) => {
    mocks.query.mockReturnValue(queryResult(assessment(status)));

    const html = render();

    expect(html).toContain(expectedCopy);
    expect(html).toMatch(/لا (?:يؤثر|يقول)/);
    expect(html).not.toMatch(/مؤهل|غير مؤهل|فشل|راسب/);
  });

  it("requests an assessment with an idempotency key", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <AdvisoryFitAssessment application={application()} />,
      );
    });
    await act(async () => {
      findButton(container, "طلب تقييم استشاري")?.click();
    });

    expect(mocks.request.mutateAsync).toHaveBeenCalledWith({
      applicationId: "application-1",
      idempotencyKey: "assessment-idempotency-key",
    });

    await act(async () => root.unmount());
    container.remove();
  });
});

function render() {
  return renderToStaticMarkup(
    <AdvisoryFitAssessment application={application()} />,
  );
}

function queryResult(data: AdvisoryFitAssessmentDto) {
  return {
    isPending: false,
    isError: false,
    data,
    error: null,
    refetch: vi.fn(),
  };
}

function assessment(
  status: AdvisoryFitAssessmentDto["requestStatus"],
): AdvisoryFitAssessmentDto {
  const completed = status === "COMPLETED";
  return {
    id: completed ? "assessment-1" : null,
    applicationId: "application-1",
    requestStatus: status,
    fitBand: completed ? "STRONG" : status === "UNAVAILABLE" ? "UNAVAILABLE" : null,
    findings: completed
      ? [
          {
            requirementId: "required-1",
            requirementKind: "REQUIRED",
            finding: "SUPPORTED",
            confidence: "HIGH",
            citations: ["github:evidence-1"],
            uncertainty: ["الدليل حديث لكن نطاقه محدود."],
            explanation: "تظهر الأدلة المقدمة خبرة مباشرة في المتطلب.",
          },
          {
            requirementId: "preferred-1",
            requirementKind: "PREFERRED",
            finding: "INCONCLUSIVE",
            confidence: "LOW",
            citations: ["github:evidence-1"],
            uncertainty: ["لا يذكر الدليل هذا الجانب بوضوح."],
            explanation: "الدليل غير حاسم لهذا المتطلب المفضل.",
          },
        ]
      : [],
    presentedAt: completed ? "2026-08-02T12:00:05.000Z" : null,
    requestedAt: completed ? "2026-08-02T12:00:00.000Z" : null,
    completedAt: completed ? "2026-08-02T12:00:05.000Z" : null,
    attempts: completed ? 1 : 0,
  };
}

function application(): ApplicationDto {
  return {
    id: "application-1",
    contributionRequestId: "request-1",
    contributor: {
      id: "contributor-1",
      username: "sara",
      displayName: "سارة أحمد",
    },
    profileContext: {
      bio: null,
      availability: null,
      experienceLevel: null,
      fields: [],
      declaredSkills: [],
    },
    contributionApproach: "سأنفذ التدفق.",
    proposedDeliveryDurationDays: 5,
    status: "PENDING_OWNER_REVIEW",
    requirementSnapshot: {
      required: [{ id: "required-1", position: 0, text: "NestJS" }],
      preferred: [{ id: "preferred-1", position: 1, text: "GraphQL" }],
    },
    evidenceSummary: [],
    submittedAt: "2026-08-02T10:00:00.000Z",
    reviewDueAt: null,
    expiresAt: null,
    expiredAt: null,
    overdue: false,
    ownerDecision: null,
    assignment: null,
  };
}

function findButton(container: HTMLElement, label: string) {
  return [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent.trim() === label,
  );
}
