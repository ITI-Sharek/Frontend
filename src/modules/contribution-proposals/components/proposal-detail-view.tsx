import { Link } from "@tanstack/react-router";
import { Flag, History, Send, UserRoundCheck } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import { ProposalActionDialog } from "./proposal-action-dialog";
import { ProposalEditor } from "./proposal-editor";
import type {
  ContributionProposalDto,
  ContributionProposalFields,
} from "../types/contribution-proposal.types";
import {
  formatProposalDate,
  formatProposerLabel,
  PROPOSAL_STATUS_META,
  RESULTING_REQUEST_COPY,
} from "../utils/proposal-presenter";
import { toProposalFields } from "../utils/proposal-fields";

export type ProposalDetailAction =
  | "accept"
  | "decline"
  | "request-revision"
  | "withdraw"
  | "report";

export function ProposalDetailView({
  proposal,
  role,
  busyAction,
  actionError,
  reportSuccess,
  onAction,
  onSubmitVersion,
}: {
  proposal: ContributionProposalDto;
  role: "owner" | "contributor";
  busyAction: ProposalDetailAction | "version" | null;
  actionError: string | null;
  reportSuccess: string | null;
  onAction: (action: ProposalDetailAction, reason: string) => Promise<void>;
  onSubmitVersion: (fields: ContributionProposalFields) => Promise<void>;
}) {
  const [dialog, setDialog] = useState<ProposalDetailAction | null>(null);
  const [showVersionEditor, setShowVersionEditor] = useState(false);
  const status = PROPOSAL_STATUS_META[proposal.status];
  const latest = proposal.latestVersion;
  const isPending = proposal.status === "PENDING";
  const mayRevise =
    role === "contributor" && isPending && proposal.revisionRequestedAt !== null;

  const timeline = [
    ...proposal.versions.map((version) => ({
      key: `version-${version.version}`,
      date: version.createdAt,
      kind: "version" as const,
      version,
    })),
    ...proposal.revisionRequests.map((request, index) => ({
      key: `revision-${index}-${request.requestedAt}`,
      date: request.requestedAt,
      kind: "revision" as const,
      request,
    })),
  ].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  const dialogConfig = dialog ? getDialogConfig(dialog) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
      <header className="rounded-card border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">مقترح مساهمة خاص</p>
            <h1 className="mt-1 text-xl font-bold text-foreground">
              {latest?.title ?? "مقترح بدون نسخة متاحة"}
            </h1>
            {role === "owner" && (
              <p className="mt-1 text-xs font-medium text-foreground">
                من {formatProposerLabel(proposal.proposerName, proposal.proposerUsername)}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              النسخة الحالية {proposal.currentVersion} · أُنشئ {formatProposalDate(proposal.createdAt)}
            </p>
          </div>
          <StatusChip tone={status.tone} icon={status.icon}>{status.label}</StatusChip>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{status.description}</p>
      </header>

      {proposal.status === "DECLINED" && proposal.declineReason && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">سبب اعتذار صاحب المشروع</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {proposal.declineReason}
          </p>
        </Card>
      )}

      {proposal.status === "ACCEPTED" && proposal.resultingContributionRequestStatus && (
        <Card className="border-primary/25 bg-primary/5">
          <div className="flex items-start gap-3">
            <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-foreground">حالة طلب المساهمة الناتج</h2>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                {RESULTING_REQUEST_COPY[proposal.resultingContributionRequestStatus]}
              </p>
              {proposal.resultingContributionRequestId &&
                (role === "owner" || proposal.resultingContributionRequestStatus === "PUBLISHED") && (
                  <Link
                    className="mt-3 inline-flex text-sm font-semibold text-primary"
                    to={
                      role === "owner"
                        ? ROUTES.contributionRequest(proposal.resultingContributionRequestId)
                        : ROUTES.task(proposal.resultingContributionRequestId)
                    }
                  >
                    فتح طلب المساهمة
                  </Link>
                )}
            </div>
          </div>
        </Card>
      )}

      {isPending && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">الإجراءات المتاحة</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {role === "owner" ? (
              <>
                <Button type="button" size="sm" onClick={() => setDialog("accept")}>قبول كمسودة منسوبة</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("request-revision")}>طلب مراجعة</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("decline")}>الاعتذار عن المقترح</Button>
              </>
            ) : (
              <>
                {mayRevise && (
                  <Button type="button" size="sm" onClick={() => setShowVersionEditor((value) => !value)}>
                    <Send className="size-4" /> إرسال نسخة جديدة
                  </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("withdraw")}>سحب المقترح</Button>
              </>
            )}
          </div>
        </Card>
      )}

      {showVersionEditor && mayRevise && latest && (
        <Card>
          <h2 className="mb-2 text-base font-bold text-foreground">نسخة جديدة ردًا على طلب المراجعة</h2>
          <p className="mb-5 text-xs leading-6 text-muted-foreground">
            ستبقى النسخ السابقة كما هي. تأكد أن النسخة الجديدة تعبّر عن كلماتك أنت قبل الإرسال.
          </p>
          <ProposalEditor
            initialValue={toProposalFields(latest)}
            requiresDisclosure={false}
            isSubmitting={busyAction === "version"}
            submitLabel="تأكيد وإرسال نسخة جديدة"
            error={actionError}
            onSubmit={onSubmitVersion}
          />
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">السجل الزمني الخاص</h2>
        </div>
        <ol className="mt-5 space-y-4">
          {timeline.map((item) => (
            <li key={item.key} className="border-s-2 border-border ps-4">
              {item.kind === "version" ? (
                <>
                  <h3 className="text-sm font-bold text-foreground">نسخة {item.version.version}: {item.version.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">كتبها المساهم · {formatProposalDate(item.version.createdAt)}</p>
                  <dl className="mt-3 space-y-3 text-sm">
                    <TimelineField label="المشكلة أو الفرصة" value={item.version.problemOrOpportunity} />
                    <TimelineField label="النتيجة المقترحة" value={item.version.proposedOutcome} />
                    <TimelineField label="فائدة المشروع" value={item.version.projectBenefit} />
                  </dl>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-foreground">طلب مراجعة من صاحب المشروع</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{formatProposalDate(item.request.requestedAt)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {item.request.reason ?? "طلب صاحب المشروع مراجعة النسخة دون ملاحظات إضافية."}
                  </p>
                </>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="border-dashed">
        <h2 className="text-sm font-bold text-foreground">إبلاغ واقعي للمراجعة الإشرافية</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          يحفظ البلاغ النسخة والتوقيت للمراجعة فقط. المنصة لا تقرر تلقائيًا وجود نسخ أو سرقة أو ملكية أو مخالفة قانونية.
        </p>
        {reportSuccess && <p role="status" className="mt-3 text-sm text-evidence-teal">{reportSuccess}</p>}
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setDialog("report")}>
          <Flag className="size-4" /> إرسال بلاغ للمراجعة
        </Button>
      </Card>

      {dialogConfig && (
        <ProposalActionDialog
          isOpen
          {...dialogConfig}
          isSubmitting={busyAction === dialog}
          error={actionError}
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            try {
              await onAction(dialog!, reason);
              setDialog(null);
            } catch {
              // The route maps the stable API error; keep the dialog open so
              // the user can read it and retry the same idempotent command.
            }
          }}
        />
      )}
    </div>
  );
}

function TimelineField({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold text-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap leading-7 text-muted-foreground">{value}</dd></div>;
}

function getDialogConfig(action: ProposalDetailAction) {
  if (action === "accept") {
    return {
      title: "قبول المقترح كمسودة منسوبة",
      description: "سيُنشئ القبول مسودة يملكها صاحب المشروع من أحدث نسخة، مع حفظ الإسناد للمساهم. لن ينشئ إسناد عمل أو أولوية اختيار ولن ينشر المسودة تلقائيًا.",
      confirmLabel: "تأكيد القبول وإنشاء المسودة",
    };
  }
  if (action === "request-revision") {
    return {
      title: "طلب نسخة جديدة",
      description: "لن تتغير كلمات المساهم الحالية. اشرح التعديل المطلوب وسيقرر المساهم محتوى النسخة التالية.",
      confirmLabel: "إرسال طلب المراجعة",
      field: { label: "سبب طلب المراجعة", help: "ملاحظة واضحة ومحترمة للمساهم.", minLength: 5, maxLength: 500 },
    };
  }
  if (action === "decline") {
    return {
      title: "الاعتذار عن المقترح",
      description: "هذا قرار نهائي للمقترح ويجب أن يظهر للمساهم بسبب واضح، مع بقاء سجل النسخ محفوظًا.",
      confirmLabel: "تأكيد الاعتذار",
      destructive: true,
      field: { label: "سبب الاعتذار", help: "سبب واقعي يخص المقترح.", minLength: 5, maxLength: 500 },
    };
  }
  if (action === "withdraw") {
    return {
      title: "سحب المقترح",
      description: "السحب نهائي وينهي نظر صاحب المشروع في المقترح، مع بقاء السجل الخاص محفوظًا.",
      confirmLabel: "تأكيد السحب",
      destructive: true,
    };
  }
  return {
    title: "إرسال بلاغ للمراجعة",
    description: "صف الوقائع التي تريد من فريق الإشراف مراجعتها. هذا البلاغ لا يصدر حكمًا آليًا ولا يغيّر حالة المقترح.",
    confirmLabel: "إرسال البلاغ",
    field: { label: "تفاصيل البلاغ", help: "اكتب وقائع كافية دون بيانات خاصة غير لازمة.", minLength: 10, maxLength: 1000 },
  };
}
