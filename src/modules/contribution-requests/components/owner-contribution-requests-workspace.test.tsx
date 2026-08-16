import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OwnerContributionRequestsWorkspace } from "./owner-contribution-requests-workspace";
import { useOwnerProjectContributionRequestsQuery } from "../api/queries/use-owner-project-contribution-requests-query";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-router-link="true" href={to}>
      {children}
    </a>
  ),
}));

vi.mock(
  "../api/queries/use-owner-project-contribution-requests-query",
  () => ({
    useOwnerProjectContributionRequestsQuery: vi.fn(() => ({
      data: {
        totalCount: 0,
        byStatus: {
          published: [],
          draft: [],
          assigned: [],
          completed: [],
          cancelled: [],
          discarded: [],
        },
      },
      isPending: false,
      isError: false,
    })),
  }),
);

describe("owner Contribution Request workspace navigation", () => {
  it("opens the create screen through the client router", () => {
    const html = renderToStaticMarkup(
      <OwnerContributionRequestsWorkspace
        projectId="project-1"
        projectTitle="Sharek"
        canCreate
        requestHref={(requestId) => `/contribution-requests/${requestId}`}
        newRequestHref="/my-projects/project-1/contribution-requests/new"
      />,
    );

    expect(html).toContain('data-router-link="true"');
    expect(html).toContain(
      'href="/my-projects/project-1/contribution-requests/new"',
    );
  });

  it("labels a published request as closed after its Applications Close Time", () => {
    const closeTime = "2020-08-05T12:00:00.000Z";

    vi.mocked(
      useOwnerProjectContributionRequestsQuery,
    ).mockReturnValueOnce({
      data: {
        totalCount: 1,
        byStatus: {
          published: [makeRequest({ applicationsCloseTime: closeTime })],
          draft: [],
          assigned: [],
          completed: [],
          cancelled: [],
          discarded: [],
        },
      },
      isPending: false,
      isError: false,
    } as unknown as ReturnType<
      typeof useOwnerProjectContributionRequestsQuery
    >);

    const html = renderToStaticMarkup(
      <OwnerContributionRequestsWorkspace
        projectId="project-1"
        projectTitle="Sharek"
        canCreate
        requestHref={(requestId) => `/contribution-requests/${requestId}`}
        newRequestHref="/my-projects/project-1/contribution-requests/new"
      />,
    );

    expect(html).toContain("التقديم مغلق");
    expect(html).not.toContain(">منشور</span>");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tabpanel"');
  });
});

function makeRequest(
  overrides: Partial<{
    applicationsCloseTime: string | null;
  }> = {},
) {
  return {
    id: "request-1",
    projectId: "project-1",
    title: "Closed request",
    description: "Description",
    requiredRequirements: [],
    preferredRequirements: [],
    technologyTags: [],
    applicationsCloseTime: null,
    targetCompletionDate: null,
    difficulty: null,
    reward: null,
    rewardCurrency: null,
    status: "published" as const,
    attribution: null,
    publishedAt: "2026-07-30T00:00:00.000Z",
    createdAt: "2026-07-28T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
    ...overrides,
  };
}
