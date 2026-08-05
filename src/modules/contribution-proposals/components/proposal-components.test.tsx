import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ProposalDetailView } from "./proposal-detail-view";
import { ProposalEditor } from "./proposal-editor";
import { ProposalActionDialog } from "./proposal-action-dialog";
import type { ContributionProposalDto } from "../types/contribution-proposal.types";

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
});

function makeProposal(): ContributionProposalDto {
  return {
    id: "proposal-1",
    projectId: "project-1",
    proposerId: "contributor-1",
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
