import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OwnerContributionRequestsWorkspace } from "./owner-contribution-requests-workspace";

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
    useOwnerProjectContributionRequestsQuery: () => ({
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
    }),
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
});
