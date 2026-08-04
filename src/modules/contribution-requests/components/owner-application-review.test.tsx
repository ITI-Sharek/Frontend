// @vitest-environment happy-dom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OwnerApplicationReview } from "./owner-application-review";
import type { ApplicationDto } from "../types/application.types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  accept: { isPending: false, mutateAsync: vi.fn() },
  decline: { isPending: false, mutateAsync: vi.fn() },
  assessmentQuery: vi.fn(),
  assessmentRequest: { isPending: false, mutateAsync: vi.fn() },
}));

vi.mock("../api/queries/use-owner-applications-query", () => ({
  useOwnerApplicationsQuery: mocks.query,
}));

vi.mock("../api/mutations/use-accept-application-mutation", () => ({
  useAcceptApplicationMutation: () => mocks.accept,
}));

vi.mock("../api/mutations/use-decline-application-mutation", () => ({
  useDeclineApplicationMutation: () => mocks.decline,
}));

vi.mock("../api/queries/use-advisory-fit-query", () => ({
  useAdvisoryFitQuery: mocks.assessmentQuery,
}));

vi.mock("../api/mutations/use-request-advisory-fit-mutation", () => ({
  useRequestAdvisoryFitMutation: () => mocks.assessmentRequest,
}));

vi.mock("@/shared/utils/idempotency-key", () => ({
  createIdempotencyKey: () => "decision-idempotency-key",
}));

describe("owner Application review queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: [application("first", false), application("second", true)],
      refetch: vi.fn(),
    });
    mocks.assessmentQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: null,
        applicationId: "application-1",
        requestStatus: "NOT_REQUESTED",
        fitBand: null,
        findings: [],
        presentedAt: null,
        requestedAt: null,
        completedAt: null,
        attempts: 0,
        retryAvailable: false,
      },
      refetch: vi.fn(),
    });
  });

  it("preserves backend order and exposes the complete human review context", () => {
    const html = renderToStaticMarkup(
      <OwnerApplicationReview contributionRequestId="request-1" />,
    );

    expect(html.indexOf("المساهم first")).toBeLessThan(
      html.indexOf("المساهم second"),
    );
    expect(html).toContain("نهج المساهمة");
    expect(html).toContain("مدة التسليم المقترحة");
    expect(html).toContain("سياق الملف وقت التقديم");
    expect(html).toContain("ملخص الأدلة المثبت وقت التقديم");
    expect(html).toContain("حدود الدليل");
    expect(html).toContain("تحتاج قرارًا الآن");
    expect(html).toContain("طلب تقييم استشاري");
  });

  it("keeps both human decisions available without assessment data", () => {
    const html = renderToStaticMarkup(
      <OwnerApplicationReview contributionRequestId="request-1" />,
    );

    expect(html).toContain("اختيار وإنشاء إسناد");
    expect(html).toContain("عدم الاختيار مع ملاحظات");
    expect(html).toContain("التقييم الاستشاري اختياري");
    expect(html).not.toMatch(
      /مؤهل تلقائيًا|غير مؤهل|ناجح|راسب|توصي المنصة بالاختيار|نسبة المطابقة/,
    );
  });

  it("teaches the empty queue instead of rendering a dead end", () => {
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
      refetch: vi.fn(),
    });

    const html = renderToStaticMarkup(
      <OwnerApplicationReview contributionRequestId="request-1" />,
    );
    expect(html).toContain("لا توجد طلبات معلقة الآن");
    expect(html).toContain("ستظهر هنا طلبات التقديم الجديدة مباشرة");
  });

  it("explains missing evidence without treating it as negative fit", () => {
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: [{ ...application("empty", false), evidenceSummary: [] }],
      refetch: vi.fn(),
    });

    const html = renderToStaticMarkup(
      <OwnerApplicationReview contributionRequestId="request-1" />,
    );
    expect(html).toContain("غياب الدليل ليس حكمًا على القدرة");
    expect(html).toContain("اختيار وإنشاء إسناد");
  });

  it("refreshes server state after a stable concurrent decision conflict", async () => {
    const refetch = vi.fn().mockResolvedValue({ data: [] });
    mocks.query.mockReturnValue({
      isPending: false,
      isError: false,
      data: [application("conflict", false)],
      refetch,
    });
    mocks.accept.mutateAsync.mockRejectedValueOnce(
      axiosContractError("APPLICATION_CONCURRENT_MODIFICATION"),
    );
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <OwnerApplicationReview contributionRequestId="request-1" />,
      );
    });
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>(
          "#accept-application-trigger-conflict",
        )
        ?.click();
    });
    const confirm = [...document.querySelectorAll("button")].find((button) =>
      button.textContent.includes("تأكيد الاختيار"),
    );
    await act(async () => confirm?.click());

    expect(mocks.accept.mutateAsync).toHaveBeenCalledWith({
      applicationId: "conflict",
      idempotencyKey: "decision-idempotency-key",
    });
    expect(refetch).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("سبق إجراء تغيير");
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await act(async () => root.unmount());
    container.remove();
  });
});

function application(id: string, overdue: boolean): ApplicationDto {
  return {
    id,
    contributionRequestId: "request-1",
    contributor: {
      id: `user-${id}`,
      username: id,
      displayName: `المساهم ${id}`,
    },
    profileContext: {
      bio: "سياق مهني محفوظ وقت التقديم.",
      availability: "10 ساعات أسبوعيًا",
      experienceLevel: {
        key: "intermediate",
        labelEn: "Intermediate",
        labelAr: "متوسط",
      },
      fields: [{ key: "backend", labelEn: "Backend", labelAr: "الخلفية" }],
      declaredSkills: ["NestJS"],
    },
    contributionApproach: "سأنفذ التدفق وأضيف اختبارات واضحة.",
    proposedDeliveryDurationDays: 5,
    status: "PENDING_OWNER_REVIEW",
    requirementSnapshot: { required: [], preferred: [] },
    evidenceSummary: [
      {
        skillProfileId: `skill-${id}`,
        name: "NestJS",
        proficiencyLevel: "intermediate",
        evidenceSummary: "نفذ واجهات موثقة.",
        limitations: ["لا يوجد دليل حديث على الطوابير."],
      },
    ],
    submittedAt: "2026-07-28T10:00:00.000Z",
    reviewDueAt: "2026-07-31T10:00:00.000Z",
    expiresAt: "2026-08-04T10:00:00.000Z",
    expiredAt: null,
    overdue,
    ownerDecision: null,
    assignment: null,
  };
}

function axiosContractError(code: string) {
  return {
    isAxiosError: true,
    response: { status: 409, data: { code, message: "Contract error" } },
  };
}
