import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MyProjectsList } from "./my-projects-list";
import type {
  CursorPageInfoDto,
  MyProjectSummaryDto,
  OwnerQuotaDto,
} from "../../types/my-projects.types";

const quota: OwnerQuotaDto = { used: 1, monthlyLimit: 20 };
const pageInfo: CursorPageInfoDto = { nextCursor: null, hasNextPage: false };

const project: MyProjectSummaryDto = {
  id: "project-1",
  title: "sharek-example",
  slug: "sharek-example",
  status: "published",
  revision: 1,
  openRequestsCount: 2,
  pendingApplicationsCount: 4,
  lastActivityLabel: "منذ يوم",
};

describe("MyProjectsList", () => {
  it("presents pendingApplicationsCount as owner-review-pending, never an AI eligibility outcome", () => {
    const html = renderToStaticMarkup(
      <MyProjectsList
        projects={[project]}
        quota={quota}
        pageInfo={pageInfo}
        importHref="/my-projects/new"
        onProjectHref={(id) => `/my-projects/${id}`}
      />,
    );

    expect(html).toContain("4 طلبات بانتظار قرارك");
    expect(html).not.toContain("مؤهل");
    expect(html).not.toContain("eligible");
    expect(html).not.toContain("ineligible");
  });
});
