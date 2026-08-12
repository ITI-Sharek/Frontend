import { Check, Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/shared/components/ui/card";

import { useSetContributionProposalIntakeMutation } from "../api/mutations/use-contribution-proposal-mutations";
import {
  useContributionProposalIntakeQuery,
  useProjectContributionProposalsQuery,
} from "../api/queries/use-contribution-proposal-queries";
import { getProposalErrorMessage } from "../constants/proposal-copy";
import { ProposalListView } from "./proposal-list-view";

export function OwnerProposalWorkspace({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const query = useProjectContributionProposalsQuery(projectId);
  const proposals = query.data?.pages.flatMap((page) => page.proposals) ?? [];
  // A failed *next* page keeps `data` populated, so route it to the inline
  // load-more error instead of the terminal state that replaces the whole list.
  const hasLoadedAnyPage = query.data !== undefined;
  const message = query.isError
    ? getProposalErrorMessage(t, query.error)
    : null;

  const intakeQuery = useContributionProposalIntakeQuery(projectId);
  const intakeMutation = useSetContributionProposalIntakeMutation();
  // A Project with no stored row is accepting, so default to true rather than
  // rendering "closed" while the read is in flight.
  const intakeEnabled = intakeQuery.data?.enabled ?? true;
  const intakeError = intakeQuery.error ?? intakeMutation.error;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground">{t("proposalOwner.title")}</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {t("proposalOwner.description")}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-pressed={intakeEnabled}
          disabled={intakeQuery.isPending || intakeMutation.isPending}
          onClick={() =>
            intakeMutation.mutate({ projectId, enabled: !intakeEnabled })
          }
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-input border border-border px-3 text-sm font-semibold text-foreground hover:bg-border/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {intakeEnabled && <Check className="size-4 text-primary" aria-hidden="true" />}
          {intakeEnabled
            ? t("proposalOwner.acceptingProposals")
            : t("proposalOwner.intakeStopped")}
        </button>
      </div>

      {intakeError && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {getProposalErrorMessage(t, intakeError)}
        </p>
      )}
      <ProposalListView
        proposals={proposals}
        role="owner"
        isLoading={query.isPending}
        error={hasLoadedAnyPage ? null : message}
        loadMoreError={hasLoadedAnyPage ? message : null}
        onRetry={() => void query.refetch()}
        hasNextPage={query.hasNextPage}
        isLoadingMore={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </Card>
  );
}
