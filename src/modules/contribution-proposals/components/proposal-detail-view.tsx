import { Link } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { Flag, History, Send, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  getProposalStatusMeta,
  getResultingRequestCopy,
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
  const { t, i18n } = useTranslation();
  const [dialog, setDialog] = useState<ProposalDetailAction | null>(null);
  const [showVersionEditor, setShowVersionEditor] = useState(false);
  const statusMeta = getProposalStatusMeta(t);
  const resultingCopy = getResultingRequestCopy(t);
  const status = statusMeta[proposal.status];
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

  const dialogConfig = dialog ? getDialogConfig(t, dialog) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
      <header className="rounded-card border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("proposalDetail.privateLabel")}</p>
            <h1 className="mt-1 text-xl font-bold text-foreground">
              {latest?.title ?? t("proposalDetail.noVersionTitle")}
            </h1>
            {role === "owner" && (
              <p className="mt-1 text-xs font-medium text-foreground">
                {t("proposalDetail.from", {
                  proposer: formatProposerLabel(
                    proposal.proposerName,
                    proposal.proposerUsername,
                  ),
                })}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("proposalDetail.currentVersion", {
                version: proposal.currentVersion,
                date: formatProposalDate(proposal.createdAt, i18n.language),
              })}
            </p>
          </div>
          <StatusChip tone={status.tone} icon={status.icon}>{status.label}</StatusChip>
        </div>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{status.description}</p>
      </header>

      {proposal.status === "DECLINED" && proposal.declineReason && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">{t("proposalDetail.declineReasonTitle")}</h2>
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
              <h2 className="text-sm font-bold text-foreground">{t("proposalDetail.resultingRequestTitle")}</h2>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                {resultingCopy[proposal.resultingContributionRequestStatus]}
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
                    {t("proposalDetail.openRequest")}
                  </Link>
                )}
            </div>
          </div>
        </Card>
      )}

      {isPending && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">{t("proposalDetail.actionsTitle")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {role === "owner" ? (
              <>
                <Button type="button" size="sm" onClick={() => setDialog("accept")}>{t("proposalDetail.acceptAsDraft")}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("request-revision")}>{t("proposalDetail.requestRevision")}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("decline")}>{t("proposalDetail.decline")}</Button>
              </>
            ) : (
              <>
                {mayRevise && (
                  <Button type="button" size="sm" onClick={() => setShowVersionEditor((value) => !value)}>
                    <Send className="size-4" /> {t("proposalDetail.sendNewVersion")}
                  </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog("withdraw")}>{t("proposalDetail.withdraw")}</Button>
              </>
            )}
          </div>
        </Card>
      )}

      {showVersionEditor && mayRevise && latest && (
        <Card>
          <h2 className="mb-2 text-base font-bold text-foreground">{t("proposalDetail.newVersionTitle")}</h2>
          <p className="mb-5 text-xs leading-6 text-muted-foreground">
            {t("proposalDetail.newVersionDescription")}
          </p>
          <ProposalEditor
            initialValue={toProposalFields(latest)}
            requiresDisclosure={false}
            isSubmitting={busyAction === "version"}
            submitLabel={t("proposalDetail.submitNewVersion")}
            error={actionError}
            onSubmit={onSubmitVersion}
          />
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">{t("proposalDetail.timelineTitle")}</h2>
        </div>
        <ol className="mt-5 space-y-4">
          {timeline.map((item) => (
            <li key={item.key} className="border-s-2 border-border ps-4">
              {item.kind === "version" ? (
                <>
                  <h3 className="text-sm font-bold text-foreground">{t("proposalDetail.versionEntry", { version: item.version.version, title: item.version.title })}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t("proposalDetail.writtenByContributor", { date: formatProposalDate(item.version.createdAt, i18n.language) })}</p>
                  <dl className="mt-3 space-y-3 text-sm">
                    <TimelineField label={t("proposalEditor.problemOrOpportunity")} value={item.version.problemOrOpportunity} />
                    <TimelineField label={t("proposalEditor.proposedOutcome")} value={item.version.proposedOutcome} />
                    <TimelineField label={t("proposalEditor.projectBenefit")} value={item.version.projectBenefit} />
                  </dl>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-foreground">{t("proposalDetail.revisionEntryTitle")}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{formatProposalDate(item.request.requestedAt, i18n.language)}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {item.request.reason ?? t("proposalDetail.revisionNoReason")}
                  </p>
                </>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="border-dashed">
        <h2 className="text-sm font-bold text-foreground">{t("proposalDetail.reportTitle")}</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">
          {t("proposalDetail.reportDescription")}
        </p>
        {reportSuccess && <p role="status" className="mt-3 text-sm text-evidence-teal">{reportSuccess}</p>}
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => setDialog("report")}>
          <Flag className="size-4" /> {t("proposalDetail.reportButton")}
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

function getDialogConfig(t: TFunction, action: ProposalDetailAction) {
  if (action === "accept") {
    return {
      title: t("proposalDetail.dialogAcceptTitle"),
      description: t("proposalDetail.dialogAcceptDescription"),
      confirmLabel: t("proposalDetail.dialogAcceptConfirm"),
    };
  }
  if (action === "request-revision") {
    return {
      title: t("proposalDetail.dialogRevisionTitle"),
      description: t("proposalDetail.dialogRevisionDescription"),
      confirmLabel: t("proposalDetail.dialogRevisionConfirm"),
      field: {
        label: t("proposalDetail.dialogRevisionFieldLabel"),
        help: t("proposalDetail.dialogRevisionFieldHelp"),
        minLength: 5,
        maxLength: 500,
      },
    };
  }
  if (action === "decline") {
    return {
      title: t("proposalDetail.dialogDeclineTitle"),
      description: t("proposalDetail.dialogDeclineDescription"),
      confirmLabel: t("proposalDetail.dialogDeclineConfirm"),
      destructive: true,
      field: {
        label: t("proposalDetail.dialogDeclineFieldLabel"),
        help: t("proposalDetail.dialogDeclineFieldHelp"),
        minLength: 5,
        maxLength: 500,
      },
    };
  }
  if (action === "withdraw") {
    return {
      title: t("proposalDetail.dialogWithdrawTitle"),
      description: t("proposalDetail.dialogWithdrawDescription"),
      confirmLabel: t("proposalDetail.dialogWithdrawConfirm"),
      destructive: true,
    };
  }
  return {
    title: t("proposalDetail.dialogReportTitle"),
    description: t("proposalDetail.dialogReportDescription"),
    confirmLabel: t("proposalDetail.dialogReportConfirm"),
    field: {
      label: t("proposalDetail.dialogReportFieldLabel"),
      help: t("proposalDetail.dialogReportFieldHelp"),
      minLength: 10,
      maxLength: 1000,
    },
  };
}
