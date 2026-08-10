import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ContributionRequestForm } from "./contribution-request-form";
import { ContributionRequestCreateView } from "./contribution-request-create-view";
import { DiscardContributionRequestDialog } from "./discard-contribution-request-dialog";
import { PublishContributionRequestDialog } from "./publish-contribution-request-dialog";
import { CancelContributionRequestDialog } from "./cancel-contribution-request-dialog";
import { OwnerContributionRequestsWorkspace } from "./owner-contribution-requests-workspace";
import { createEmptyContributionRequestForm } from "../utils/contribution-request-form";
import { useOwnerProjectContributionRequestsQuery } from "../api/queries/use-owner-project-contribution-requests-query";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-router-link="true" href={to}>
      {children}
    </a>
  ),
}));

vi.mock("../api/queries/use-owner-project-contribution-requests-query", () => ({
  useOwnerProjectContributionRequestsQuery: vi.fn(),
}));

vi.mock("../api/mutations/use-contribution-request-mutations", () => ({
  useCreateContributionRequestMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("Contribution Request private draft UI", () => {
  it("renders distinct ordered Requirement sections with accessible controls", () => {
    const html = renderToStaticMarkup(
      <ContributionRequestForm
        initialState={{
          ...createEmptyContributionRequestForm(),
          requiredRequirements: ["First", "Second"],
          preferredRequirements: ["Helpful"],
        }}
        isSubmitting={false}
        submitError={null}
        submitLabel="حفظ المسودة"
        cancelHref="/my-projects/project-1"
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain("المتطلبات المطلوبة");
    expect(html).toContain("المتطلبات المفضلة");
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"));
    expect(html).toContain('aria-label="تحريك لأعلى"');
    expect(html).toContain('id="contribution-request-title" dir="rtl"');
    expect(html).toMatch(
      /type="datetime-local"[^>]*id="applications-close-time"[^>]*dir="ltr"/,
    );
    expect(html).toContain("md:grid-cols-2");
    expect(html).toContain("flex flex-wrap gap-3");
    expect(html).not.toContain("ownerId");
    expect(html).not.toContain("نشر الطلب");
    expect(html).not.toContain("إلغاء الطلب");
  });

  it("explains that discard is terminal history preservation, not deletion", () => {
    const html = renderToStaticMarkup(
      <DiscardContributionRequestDialog
        isOpen
        isDiscarding={false}
        error={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(html).toContain("إجراء نهائي");
    expect(html).toContain("لا يحذف السجل");
    expect(html).toContain('aria-modal="true"');
  });

  it("confirms publication makes the Request visible to contributors", () => {
    const html = renderToStaticMarkup(
      <PublishContributionRequestDialog
        isOpen
        isPublishing={false}
        error={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(html).toContain("مرئيًا للمساهمين");
    expect(html).toContain('aria-modal="true"');
  });

  it("describes the current save-then-publish lifecycle during creation", () => {
    const html = renderToStaticMarkup(
      <ContributionRequestCreateView
        projectId="project-1"
        projectTitle="Sharek"
        cancelHref="/my-projects/project-1"
        onCreated={vi.fn()}
      />,
    );

    expect(html).toContain("بعد حفظ المسودة");
    expect(html).toContain("نشرها");
    expect(html).not.toContain("مرحلة لاحقة");
  });

  it("explains cancellation preserves Application and decision history", () => {
    const html = renderToStaticMarkup(
      <CancelContributionRequestDialog
        isOpen
        isCancelling={false}
        error={null}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(html).toContain("إجراء نهائي");
    expect(html).toContain("يحافظ على سجل");
    expect(html).toContain('aria-modal="true"');
  });

  it("separates owner requests into lifecycle tabs and renders the active tab", () => {
    vi.mocked(useOwnerProjectContributionRequestsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        projectId: "project-1",
        totalCount: 2,
        byStatus: {
          draft: [makeRequest({ id: "draft-1", title: "Draft request" })],
          published: [
            makeRequest({ id: "published-1", title: "Published request" }),
          ],
          assigned: [],
          completed: [],
          cancelled: [],
          discarded: [],
        },
      },
    } as unknown as ReturnType<
      typeof useOwnerProjectContributionRequestsQuery
    >);

    const html = renderToStaticMarkup(
      <OwnerContributionRequestsWorkspace
        projectId="project-1"
        projectTitle="Sharek"
        canCreate
        requestHref={(id) => `/contribution-requests/${id}`}
        newRequestHref="/my-projects/project-1/contribution-requests/new"
      />,
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain("Published request");
    expect(html).toContain("مسودات");
    expect(html).not.toContain("Draft request");
    expect(html).not.toContain("assigned-1");
  });

  it("shows a create call-to-action when the owner workspace list is empty", () => {
    vi.mocked(useOwnerProjectContributionRequestsQuery).mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        projectId: "project-1",
        totalCount: 0,
        byStatus: {
          draft: [],
          published: [],
          assigned: [],
          completed: [],
          cancelled: [],
          discarded: [],
        },
      },
    } as unknown as ReturnType<
      typeof useOwnerProjectContributionRequestsQuery
    >);

    const html = renderToStaticMarkup(
      <OwnerContributionRequestsWorkspace
        projectId="project-1"
        projectTitle="Sharek"
        canCreate
        requestHref={(id) => `/contribution-requests/${id}`}
        newRequestHref="/my-projects/project-1/contribution-requests/new"
      />,
    );

    expect(html).toContain("لا توجد طلبات مساهمة بعد");
  });
});

function makeRequest(overrides: { id: string; title: string }) {
  return {
    id: overrides.id,
    projectId: "project-1",
    title: overrides.title,
    description: "Description",
    requiredRequirements: [],
    preferredRequirements: [],
    technologyTags: [],
    applicationsCloseTime: null,
    targetCompletionDate: null,
    difficulty: null,
    reward: null,
    rewardCurrency: null,
    status: "draft" as const,
    publishedAt: null,
    createdAt: "2026-07-28T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
  };
}
