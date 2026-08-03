import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ContributorContributionRequestDetailView } from "./contributor-contribution-request-detail-view";
import { useContributionRequestDetailsQuery } from "../api/queries/use-contribution-request-details-query";

vi.mock("../api/queries/use-contribution-request-details-query", () => ({
  useContributionRequestDetailsQuery: vi.fn(),
}));

vi.mock("../api/mutations/use-submit-application-mutation", () => ({
  useSubmitApplicationMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("Contribution Request contributor details", () => {
  it("distinguishes the work contract and submits directly to the owner", () => {
    vi.mocked(useContributionRequestDetailsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: "request-1",
        projectId: "project-1",
        projectName: "Sharek Platform",
        projectSlug: "sharek-platform",
        title: "Build the notification center",
        description: "Deliver an accessible real-time notification center.",
        technologyTags: ["React", "WebSocket"],
        difficulty: "intermediate",
        applicationsCloseAt: "2030-08-10T12:00:00.000Z",
        targetCompletionDate: "2030-08-20",
        reward: { amount: 250, currency: "USD" },
        status: "published",
        requirements: [
          {
            id: "required-1",
            text: "Keyboard-accessible interactions",
            classification: "required",
          },
          {
            id: "preferred-1",
            text: "Experience with WebSocket",
            classification: "preferred",
          },
        ],
      },
    } as unknown as ReturnType<typeof useContributionRequestDetailsQuery>);

    const html = renderToStaticMarkup(
      <ContributorContributionRequestDetailView
        requestId="request-1"
        requestsHref="/tasks"
        dashboardHref="/dashboard"
        applicationHref={(applicationId) => `/applications/${applicationId}`}
        projectHref={(slug) => `/projects/${slug}`}
        onApplicationSubmitted={vi.fn()}
      />,
    );

    expect(html).toContain("المتطلبات المطلوبة");
    expect(html).toContain("المتطلبات المفضلة");
    expect(html).toContain("التقنيات");
    expect(html).toContain("وقت إغلاق التقديم");
    expect(html).toContain("تاريخ الإنجاز المستهدف");
    expect(html).toContain("نهج المساهمة");
    expect(html).toContain("مدة التسليم المقترحة");
    expect(html).toContain("يُرسل طلب التقديم مباشرة إلى صاحب المشروع");
    expect(html).not.toMatch(/محاولات|فحص أهلية|اجتياز|قيد التحقق/);
  });
});
