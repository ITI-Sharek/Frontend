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

  it("renders status tabs and search field when projects exist", () => {
    const html = renderToStaticMarkup(
      <MyProjectsList
        projects={[project]}
        quota={quota}
        pageInfo={pageInfo}
        importHref="/my-projects/new"
        onProjectHref={(id) => `/my-projects/${id}`}
        filters={{ status: "published", q: "sharek" }}
      />,
    );

    expect(html).toContain("الكل");
    expect(html).toContain("منشور");
    expect(html).toContain("مسودة");
    expect(html).toContain("مؤرشف");
    expect(html).toContain('value="sharek"');
    expect(html).toContain("sharek-example");
  });

  it("renders empty filtered state when search/filter returns no projects", () => {
    const html = renderToStaticMarkup(
      <MyProjectsList
        projects={[]}
        quota={quota}
        pageInfo={pageInfo}
        importHref="/my-projects/new"
        onProjectHref={(id) => `/my-projects/${id}`}
        filters={{ q: "nonexistent" }}
        onResetFilters={() => {}}
      />,
    );

    expect(html).toContain("لم يتم العثور على مشاريع مطابقة");
    expect(html).toContain("إعادة تعيين الفلاتر");
  });

  it("renders first-import onboarding hero when user has no projects and no filter", () => {
    const html = renderToStaticMarkup(
      <MyProjectsList
        projects={[]}
        quota={quota}
        pageInfo={pageInfo}
        importHref="/my-projects/new"
        onProjectHref={(id) => `/my-projects/${id}`}
      />,
    );

    expect(html).toContain("استورد مشروعك الأول من GitHub");
  });
});
