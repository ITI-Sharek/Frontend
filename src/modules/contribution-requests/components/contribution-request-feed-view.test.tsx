import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ContributionRequestFeedView } from "./contribution-request-feed-view";
import { useContributionRequestsQuery } from "../api/queries/use-contribution-requests-query";

vi.mock("../api/queries/use-contribution-requests-query", () => ({
  useContributionRequestsQuery: vi.fn(),
}));

describe("Contribution Request contributor feed", () => {
  it("renders server-authoritative actionable Requests with structured metadata", () => {
    vi.mocked(useContributionRequestsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      isPlaceholderData: false,
      data: {
        items: [
          {
            id: "request-1",
            projectId: "project-1",
            projectName: "Sharek Platform",
            projectSlug: "sharek-platform",
            title: "Build the notification center",
            technologyTags: ["React", "WebSocket"],
            difficulty: "intermediate",
            applicationsCloseAt: "2030-08-10T12:00:00.000Z",
            targetCompletionDate: "2030-08-20",
            reward: { amount: 250, currency: "USD" },
          },
        ],
        totalCount: 1,
        technologyFacets: ["React", "WebSocket"],
      },
    } as unknown as ReturnType<typeof useContributionRequestsQuery>);

    const html = renderToStaticMarkup(
      <ContributionRequestFeedView
        filters={{ technologies: ["React"] }}
        onFiltersChange={vi.fn()}
        onReset={vi.fn()}
        requestHref={(requestId) => `/tasks/${requestId}`}
      />,
    );

    expect(html).toContain("طلبات المساهمة المتاحة");
    expect(html).toContain("Build the notification center");
    expect(html).toContain("Sharek Platform");
    expect(html).toContain("وقت إغلاق التقديم");
    expect(html).toContain("تاريخ الإنجاز المستهدف");
    expect(html).toContain("٢٥٠");
    expect(html).toContain("USD");
    expect(html).toContain("/tasks/request-1");
    expect(html).not.toMatch(/محاولات|فحص أهلية|قيد التحقق/);
  });
});
