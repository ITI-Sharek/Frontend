import { Link } from "@tanstack/react-router";
import { FilePlus2, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import type {
  ContributionProposalStatus,
  ContributionProposalSummaryDto,
} from "../types/contribution-proposal.types";
import {
  formatProposalDate,
  formatProposerLabel,
  getProposalStatusMeta,
} from "../utils/proposal-presenter";

export function ProposalListView({
  proposals,
  role,
  isLoading,
  error,
  onRetry,
  hasNextPage = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreError = null,
  activeSection,
  onSectionChange,
}: {
  proposals: ContributionProposalSummaryDto[];
  role: "owner" | "contributor";
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreError?: string | null;
  activeSection?: ContributionProposalStatus | "ALL";
  onSectionChange?: (status: ContributionProposalStatus | "ALL") => void;
}) {
  const { i18n, t } = useTranslation();
  const statusMeta = getProposalStatusMeta(t);
  const [internalStatus, setInternalStatus] = useState<
    ContributionProposalStatus | "ALL"
  >("ALL");
  const activeStatus = activeSection ?? internalStatus;

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {t("proposalList.loading")}
      </p>
    );
  }

  if (error) {
    return (
      <Card>
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={onRetry}
        >
          <RotateCcw className="size-4" /> {t("proposalList.retry")}
        </Button>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <FilePlus2
          className="mx-auto size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-semibold text-foreground">
          {role === "owner"
            ? t("proposalList.emptyOwnerTitle")
            : t("proposalList.emptyContributorTitle")}
        </p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {role === "owner"
            ? t("proposalList.emptyOwnerDescription")
            : t("proposalList.emptyContributorDescription")}
        </p>
      </Card>
    );
  }

  const statusTabs: Array<{
    id: ContributionProposalStatus | "ALL";
    label: string;
  }> = [
    { id: "ALL", label: t("common.viewAll") },
    { id: "PENDING", label: statusMeta.PENDING.label },
    { id: "ACCEPTED", label: statusMeta.ACCEPTED.label },
    { id: "DECLINED", label: statusMeta.DECLINED.label },
    { id: "WITHDRAWN", label: statusMeta.WITHDRAWN.label },
  ];
  const visibleProposals =
    activeStatus === "ALL"
      ? proposals
      : proposals.filter((proposal) => proposal.status === activeStatus);

  return (
    <Tabs
      value={activeStatus}
      onValueChange={(value) => {
        const nextStatus = statusTabs.find((tab) => tab.id === value)?.id;
        if (nextStatus) {
          if (onSectionChange) {
            onSectionChange(nextStatus);
          } else {
            setInternalStatus(nextStatus);
          }
        }
      }}
      className="gap-0"
    >
      <TabsList
        variant="line"
        aria-label={t("proposalList.statusTabsAria")}
        className="mb-4 flex w-full flex-wrap justify-start gap-2 border-b border-border bg-transparent p-0"
      >
        {statusTabs.map((tab) => {
          const count =
            tab.id === "ALL"
              ? proposals.length
              : proposals.filter((proposal) => proposal.status === tab.id)
                  .length;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="min-h-11 px-3"
            >
              {tab.label}
              <span className="rounded-full bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent
        value={activeStatus}
        className="pt-2 outline-none"
      >
        {visibleProposals.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t("proposalList.emptyStatus")}
          </p>
        ) : (
          <div className="space-y-3">
            {visibleProposals.map((proposal) => {
              const status = statusMeta[proposal.status];
              return (
                <Link
                  key={proposal.id}
                  to={ROUTES.proposal(proposal.id)}
                  className="block rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {proposal.title}
                      </h3>
                      {role === "owner" && (
                        <p className="mt-1 truncate text-xs font-medium text-foreground">
                          {t("proposalList.from", {
                            proposer: formatProposerLabel(
                              proposal.proposerName,
                              proposal.proposerUsername,
                            ),
                          })}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("proposalList.version", {
                          version: proposal.currentVersion,
                          date: formatProposalDate(
                            proposal.updatedAt,
                            i18n.language,
                          ),
                        })}
                      </p>
                    </div>
                    <StatusChip tone={status.tone} icon={status.icon}>
                      {status.label}
                    </StatusChip>
                  </div>
                  {proposal.revisionRequestedAt &&
                    proposal.status === "PENDING" && (
                      <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                        {t("proposalList.revisionWaiting")}
                      </p>
                    )}
                </Link>
              );
            })}
          </div>
        )}
      </TabsContent>

      {loadMoreError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {loadMoreError}
        </p>
      )}

      {hasNextPage && onLoadMore && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoadingMore}
            onClick={onLoadMore}
          >
            {isLoadingMore && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {t("proposalList.loadMore")}
          </Button>
        </div>
      )}
    </Tabs>
  );
}
