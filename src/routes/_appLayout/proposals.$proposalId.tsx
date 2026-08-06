import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, RotateCcw } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import {
  getProposalErrorMessage,
  ProposalDetailView,
  shouldRefreshProposalAfterError,
  useAcceptContributionProposalMutation,
  useContributionProposalQuery,
  useDeclineContributionProposalMutation,
  useReportContributionProposalMisuseMutation,
  useRequestContributionProposalRevisionMutation,
  useSubmitContributionProposalVersionMutation,
  useWithdrawContributionProposalMutation,
} from "@/modules/contribution-proposals";
import type {
  ContributionProposalFields,
  ProposalDetailAction,
} from "@/modules/contribution-proposals";
import { Button } from "@/shared/components/ui/button";
import {
  PageContainer,
  PageFeedback,
} from "@/shared/components/layout/page-layout";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

import { invalidateProposalAcceptanceSideEffects } from "./proposals.helpers";

export const Route = createFileRoute("/_appLayout/proposals/$proposalId")({
  head: () => ({ meta: [{ title: "تفاصيل مقترح المساهمة | Sharek" }] }),
  component: ProposalDetailsPage,
});

function useProposalCommandKeys() {
  const keys = useRef(new Map<string, string>());
  return (token: string) => {
    const current = keys.current.get(token);
    if (current) return current;
    const next = createIdempotencyKey();
    keys.current.set(token, next);
    return next;
  };
}

function ProposalDetailsPage() {
  const { proposalId } = Route.useParams();
  const { currentUser } = Route.useRouteContext();
  const query = useContributionProposalQuery(proposalId);
  const queryClient = useQueryClient();
  const acceptMutation = useAcceptContributionProposalMutation();
  const declineMutation = useDeclineContributionProposalMutation();
  const revisionMutation = useRequestContributionProposalRevisionMutation();
  const withdrawMutation = useWithdrawContributionProposalMutation();
  const reportMutation = useReportContributionProposalMisuseMutation();
  const versionMutation = useSubmitContributionProposalVersionMutation();
  const getCommandKey = useProposalCommandKeys();
  const [busyAction, setBusyAction] = useState<ProposalDetailAction | "version" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  if (query.isPending) {
    return <p role="status" className="p-8 text-center text-sm text-muted-foreground">جارٍ تحميل المقترح…</p>;
  }

  // A failed load and "you are not a party to this proposal" used to share one
  // dead-end screen. Only the first is recoverable, and it was the one with no
  // way out short of reloading the page.
  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر تحميل المقترح"
          description={getProposalErrorMessage(query.error)}
          action={
            <Button size="sm" onClick={() => void query.refetch()}>
              <RotateCcw className="size-4" aria-hidden="true" /> إعادة المحاولة
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!currentUser || currentUser.role === "admin") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-foreground">المقترح غير متاح</h1>
        <p role="alert" className="mt-3 text-sm text-destructive">
          هذا المسار مخصص لأطراف المقترح.
        </p>
      </div>
    );
  }

  const proposal = query.data;
  const commandToken = `${proposal.status}:${proposal.currentVersion}:${proposal.updatedAt}`;

  async function runAction(action: ProposalDetailAction, reason: string) {
    setBusyAction(action);
    setActionError(null);
    setReportSuccess(null);
    const reasonFingerprint =
      action === "decline" || action === "request-revision" || action === "report"
        ? `:${reason.trim()}`
        : "";
    const command = {
      proposalId,
      idempotencyKey: getCommandKey(
        `${action}:${commandToken}${reasonFingerprint}`,
      ),
    };

    try {
      if (action === "accept") {
        const accepted = await acceptMutation.mutateAsync(command);
        await invalidateProposalAcceptanceSideEffects(queryClient, accepted);
      }
      if (action === "decline") await declineMutation.mutateAsync({ ...command, reason });
      if (action === "request-revision") await revisionMutation.mutateAsync({ ...command, reason });
      if (action === "withdraw") await withdrawMutation.mutateAsync(command);
      if (action === "report") {
        await reportMutation.mutateAsync({ ...command, reason });
        setReportSuccess("وصل البلاغ إلى سجل المراجعة الإشرافية دون تغيير حالة المقترح.");
      }
    } catch (error) {
      setActionError(getProposalErrorMessage(error));
      if (shouldRefreshProposalAfterError(error)) await query.refetch();
      throw error;
    } finally {
      setBusyAction(null);
    }
  }

  async function submitVersion(fields: ContributionProposalFields) {
    setBusyAction("version");
    setActionError(null);
    const versionFingerprint = JSON.stringify(fields);
    try {
      await versionMutation.mutateAsync({
        ...fields,
        proposalId,
        idempotencyKey: getCommandKey(
          `version:${commandToken}:${versionFingerprint}`,
        ),
      });
    } catch (error) {
      setActionError(getProposalErrorMessage(error));
      if (shouldRefreshProposalAfterError(error)) await query.refetch();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <ProposalDetailView
      proposal={proposal}
      role={currentUser.role}
      busyAction={busyAction}
      actionError={actionError}
      reportSuccess={reportSuccess}
      onAction={runAction}
      onSubmitVersion={submitVersion}
    />
  );
}
