import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { PublicProjectDetailView } from "./public-project-detail-view";
import type { PublicProjectDetailDto } from "../types/public-project.types";

const publicBackedProject: PublicProjectDetailDto = {
  id: "project-1",
  slug: "sharek-example",
  title: "ShareK Example",
  description: "Reviewed owner copy",
  tags: ["collaboration"],
  technologies: ["TypeScript"],
  category: "web",
  difficulty: "intermediate",
  heroImageUrl: null,
  publishedAt: "2026-07-21T10:10:00.000Z",
  owner: null,
  source: {
    provider: "github",
    attributionStatus: "public",
    fullName: "sharek/example",
    repositoryUrl: "https://github.com/sharek/example",
    fetchedAt: "2026-07-21T10:00:02.000Z",
    statistics: {
      stars: 0,
      forks: 0,
      contributors: null,
      latestCommitAt: null,
      sourceUpdatedAt: null,
      defaultBranch: null,
      recentCommits: [],
      rootEntries: [],
      rootEntriesUnavailableReason: null,
      treeEntries: [],
      treeTruncated: false,
      treeUnavailableReason: null,
    },
  },
};

describe("PublicProjectDetailView", () => {
  it("renders repository attribution and fetch time for a public-backed project", () => {
    const html = render(
      <PublicProjectDetailView project={publicBackedProject} exploreHref="/explore" />,
    );

    expect(html).toContain("sharek/example");
    expect(html).toContain("https://github.com/sharek/example");
    expect(html).toContain("آخر جلب للبيانات");
  });

  it("withholds source details for a private-backed project without fabricating data", () => {
    const withheld: PublicProjectDetailDto = {
      ...publicBackedProject,
      source: { provider: "github", attributionStatus: "withheld" },
    };

    const html = render(
      <PublicProjectDetailView project={withheld} exploreHref="/explore" />,
    );

    expect(html).toContain("تفاصيل مصدر هذا المشروع غير متاحة للعرض حالياً");
    expect(html).not.toContain("sharek/example");
    expect(html).not.toContain("فتح على GitHub");
  });

  it("does not throw and shows a fallback when optional fields are null", () => {
    const minimal: PublicProjectDetailDto = {
      ...publicBackedProject,
      description: null,
      category: null,
      difficulty: null,
      tags: [],
      technologies: [],
      source: {
        provider: "github",
        attributionStatus: "public",
        fullName: "sharek/example",
        repositoryUrl: "https://github.com/sharek/example",
        fetchedAt: null,
        statistics: {
          stars: 0,
          forks: 0,
          contributors: null,
          latestCommitAt: null,
          sourceUpdatedAt: null,
          defaultBranch: null,
          recentCommits: [],
          rootEntries: [],
          rootEntriesUnavailableReason: null,
          treeEntries: [],
          treeTruncated: false,
          treeUnavailableReason: null,
        },
      },
    };

    const html = render(
      <PublicProjectDetailView project={minimal} exploreHref="/explore" />,
    );

    expect(html).toContain("لا يوجد وصف لهذا المشروع بعد");
    expect(html).not.toContain("آخر جلب للبيانات");
  });

  it("renders the route-composed proposal action without coupling project UI to proposals", () => {
    const html = render(
      <PublicProjectDetailView
        project={publicBackedProject}
        exploreHref="/explore"
        proposalAction={<a href="/proposals/new?projectId=project-1">إرسال مقترح مساهمة</a>}
      />,
    );

    expect(html).toContain("إرسال مقترح مساهمة");
    expect(html).toContain("/proposals/new?projectId=project-1");
  });

  it("renders route-composed Project Materials for an authenticated reader", () => {
    const html = render(
      <PublicProjectDetailView
        project={publicBackedProject}
        exploreHref="/explore"
        materialsSlot={<p>كراسة المشروع متاحة للقراءة</p>}
      />,
    );

    expect(html).toContain("كراسة المشروع متاحة للقراءة");
  });

  it("renders Edit Project and omits Apply button when viewed by project owner", () => {
    const html = render(
      <PublicProjectDetailView
        project={publicBackedProject}
        exploreHref="/explore"
        isOwner={true}
        currentUserRole="owner"
      />,
    );

    expect(html).toContain("تعديل المشروع");
    expect(html).toContain("/my-projects/project-1");
    expect(html).not.toContain("تقديم على المشروع");
  });

  it("renders Apply button when viewed by a contributor or non-owner", () => {
    const html = render(
      <PublicProjectDetailView
        project={publicBackedProject}
        exploreHref="/explore"
        isOwner={false}
        currentUserRole="contributor"
      />,
    );

    expect(html).toContain("تقديم على المشروع");
    expect(html).not.toContain("تعديل المشروع");
  });
});

function render(view: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>{view}</QueryClientProvider>,
  );
}
