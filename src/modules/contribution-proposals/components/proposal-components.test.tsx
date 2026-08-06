import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ProposalDetailView } from "./proposal-detail-view";
import { ProposalEditor } from "./proposal-editor";
import { ProposalActionDialog } from "./proposal-action-dialog";
import { ProposalListView } from "./proposal-list-view";
import type {
  ContributionProposalDto,
  ContributionProposalSummaryDto,
} from "../types/contribution-proposal.types";

// These render through renderToStaticMarkup with no router, so a real <Link>
// would throw for want of router context. `data-router-link` lets the
// assertions below prove a client-side link is used rather than a raw anchor.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-router-link="true" href={to}>
      {children}
    </a>
  ),
}));

describe("Contribution Proposal UI contract", () => {
  it("requires the attribution and assignment disclosure without application quota language", () => {
    const html = renderToStaticMarkup(
      <ProposalEditor
        requiresDisclosure
        isSubmitting={false}
        submitLabel="إرسال المقترح"
        error={null}
        onSubmit={vi.fn()}
      />,
    );

    expect(html).toContain("الإسناد المعنوي فقط");
    expect(html).toContain("لا يمنحني القبول إسناد العمل أو أولوية الاختيار");
    expect(html).toContain("وقد ينفذ العمل مساهم آخر");
    expect(html).not.toMatch(/محاولات|طلب تقديم واحد|فحص أهلية|اجتياز/);
  });

  it("shows private immutable history and contributor revision controls", () => {
    const html = renderToStaticMarkup(
      <ProposalDetailView
        proposal={makeProposal()}
        role="contributor"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );

    expect(html).toContain("السجل الزمني الخاص");
    expect(html).toContain("نسخة 1");
    expect(html).toContain("طلب مراجعة من صاحب المشروع");
    expect(html).toContain("إرسال نسخة جديدة");
    expect(html).toContain("سحب المقترح");
    expect(html).not.toContain("قبول كمسودة منسوبة");
  });

  it("offers owner decisions, mandatory decline reason flow, and factual reporting copy", () => {
    const html = renderToStaticMarkup(
      <ProposalDetailView
        proposal={makeProposal()}
        role="owner"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );

    expect(html).toContain("قبول كمسودة منسوبة");
    expect(html).toContain("طلب مراجعة");
    expect(html).toContain("الاعتذار عن المقترح");
    expect(html).toContain("إبلاغ واقعي");
    expect(html).toContain("لا تقرر تلقائيًا وجود نسخ أو سرقة أو ملكية أو مخالفة قانونية");
    expect(html).not.toContain("إرسال نسخة جديدة");
  });

  it("keeps accepted owner drafts private and explains discarded lifecycle state", () => {
    const html = renderToStaticMarkup(
      <ProposalDetailView
        proposal={{
          ...makeProposal(),
          status: "ACCEPTED",
          acceptedAt: "2026-08-03T10:00:00.000Z",
          resultingContributionRequestId: "request-1",
          resultingContributionRequestStatus: "DISCARDED",
        }}
        role="contributor"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );

    expect(html).toContain("تخلّى صاحب المشروع عن المسودة الناتجة");
    expect(html).not.toContain("فتح طلب المساهمة");
    expect(html).not.toContain("الإجراءات المتاحة");
  });

  it("renders an accessible reason dialog with contract-matching bounds", () => {
    const html = renderToStaticMarkup(
      <ProposalActionDialog
        isOpen
        title="الاعتذار عن المقترح"
        description="اشرح القرار للمساهم."
        confirmLabel="تأكيد الاعتذار"
        field={{
          label: "سبب الاعتذار",
          help: "سبب واقعي يخص المقترح.",
          minLength: 5,
          maxLength: 500,
        }}
        isSubmitting={false}
        error={null}
        destructive
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('minLength="5"');
    expect(html).toContain('maxLength="500"');
  });

  it("offers a load-more control only while the keyset cursor has another page", () => {
    const withMore = renderToStaticMarkup(
      <ProposalListView
        proposals={[makeProposalSummary()]}
        role="owner"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        hasNextPage
        isLoadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );
    const lastPage = renderToStaticMarkup(
      <ProposalListView
        proposals={[makeProposalSummary()]}
        role="owner"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
        hasNextPage={false}
        isLoadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(withMore).toContain("تحميل المزيد");
    expect(lastPage).not.toContain("تحميل المزيد");
  });

  it("keeps the loaded list visible when only the next page fails", () => {
    const html = renderToStaticMarkup(
      <ProposalListView
        proposals={[makeProposalSummary()]}
        role="contributor"
        isLoading={false}
        error={null}
        loadMoreError="تعذر تحميل المزيد."
        onRetry={vi.fn()}
        hasNextPage
        isLoadingMore={false}
        onLoadMore={vi.fn()}
      />,
    );

    expect(html).toContain("تعذر تحميل المزيد.");
    expect(html).toContain("مقترح منشور");
  });

  it("shows the owner who sent each proposal, but does not tell a contributor about themselves", () => {
    const props = {
      proposals: [makeProposalSummary()],
      isLoading: false,
      error: null,
      onRetry: vi.fn(),
    };

    const ownerHtml = renderToStaticMarkup(
      <ProposalListView {...props} role="owner" />,
    );
    const contributorHtml = renderToStaticMarkup(
      <ProposalListView {...props} role="contributor" />,
    );

    expect(ownerHtml).toContain("Nour Hassan");
    expect(ownerHtml).toContain("@nour");
    expect(contributorHtml).not.toContain("Nour Hassan");
  });

  it("omits the handle rather than rendering a bare @ when the proposer has no username", () => {
    const html = renderToStaticMarkup(
      <ProposalListView
        proposals={[{ ...makeProposalSummary(), proposerUsername: null }]}
        role="owner"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    );

    expect(html).toContain("Nour Hassan");
    expect(html).not.toContain("@");
  });

  it("identifies the proposer in the owner detail header", () => {
    const html = renderToStaticMarkup(
      <ProposalDetailView
        proposal={makeProposal()}
        role="owner"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );

    expect(html).toContain("Nour Hassan");
    expect(html).toContain("@nour");
  });

  it("navigates client-side so the query cache survives a proposal click", () => {
    const listHtml = renderToStaticMarkup(
      <ProposalListView
        proposals={[makeProposalSummary()]}
        role="contributor"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />,
    );

    expect(listHtml).toContain('data-router-link="true"');
    expect(listHtml).toContain('href="/proposals/proposal-1"');
  });

  it("links an accepted proposal to the resulting request without a full reload", () => {
    const accepted = {
      ...makeProposal(),
      status: "ACCEPTED" as const,
      resultingContributionRequestId: "request-1",
      resultingContributionRequestStatus: "PUBLISHED" as const,
    };

    const ownerHtml = renderToStaticMarkup(
      <ProposalDetailView
        proposal={accepted}
        role="owner"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );
    const contributorHtml = renderToStaticMarkup(
      <ProposalDetailView
        proposal={accepted}
        role="contributor"
        busyAction={null}
        actionError={null}
        reportSuccess={null}
        onAction={vi.fn()}
        onSubmitVersion={vi.fn()}
      />,
    );

    expect(ownerHtml).toContain('href="/contribution-requests/request-1"');
    expect(contributorHtml).toContain('href="/tasks/request-1"');
    expect(ownerHtml).toContain('data-router-link="true"');
    expect(contributorHtml).toContain('data-router-link="true"');
  });
});

function makeProposalSummary(): ContributionProposalSummaryDto {
  return {
    id: "proposal-1",
    projectId: "project-1",
    proposerId: "contributor-1",
    proposerName: "Nour Hassan",
    proposerUsername: "nour",
    status: "PENDING",
    currentVersion: 1,
    title: "مقترح منشور",
    revisionRequestedAt: null,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  };
}

function makeProposal(): ContributionProposalDto {
  return {
    id: "proposal-1",
    projectId: "project-1",
    proposerId: "contributor-1",
    proposerName: "Nour Hassan",
    proposerUsername: "nour",
    status: "PENDING",
    currentVersion: 1,
    disclosure: { version: "v1", acknowledgedAt: "2026-08-01T10:00:00.000Z" },
    revisionRequestedAt: "2026-08-02T10:00:00.000Z",
    acceptedAt: null,
    declinedAt: null,
    declineReason: null,
    resultingContributionRequestId: null,
    resultingContributionRequestStatus: null,
    latestVersion: {
      version: 1,
      title: "Improve onboarding",
      problemOrOpportunity: "Contributors need clearer first steps.",
      proposedOutcome: "Create a guided contribution checklist.",
      projectBenefit: "Reduce setup time for new contributors.",
      authoredBy: "contributor-1",
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    versions: [
      {
        version: 1,
        title: "Improve onboarding",
        problemOrOpportunity: "Contributors need clearer first steps.",
        proposedOutcome: "Create a guided contribution checklist.",
        projectBenefit: "Reduce setup time for new contributors.",
        authoredBy: "contributor-1",
        createdAt: "2026-08-01T10:00:00.000Z",
      },
    ],
    revisionRequests: [
      {
        reason: "Please make the outcome more specific.",
        requestedBy: "owner-1",
        requestedAt: "2026-08-02T10:00:00.000Z",
      },
    ],
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
  };
}
