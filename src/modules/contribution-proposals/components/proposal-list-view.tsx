import { Link } from "@tanstack/react-router";
import { FilePlus2, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import type {
  ContributionProposalStatus,
  ContributionProposalSummaryDto,
} from "../types/contribution-proposal.types";
import {
  formatProposalDate,
  formatProposerLabel,
  PROPOSAL_STATUS_META,
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
}) {
  const [activeStatus, setActiveStatus] = useState<
    ContributionProposalStatus | "ALL"
  >("ALL");

  if (isLoading) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        جارٍ تحميل المقترحات…
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
          <RotateCcw className="size-4" /> إعادة المحاولة
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
            ? "لا توجد مقترحات لهذا المشروع"
            : "لم ترسل مقترحات بعد"}
        </p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {role === "owner"
            ? "ستظهر هنا المقترحات الخاصة المرسلة إلى مشروعك."
            : "ابدأ من الصفحة العامة لمشروع منشور يقبل المقترحات."}
        </p>
      </Card>
    );
  }

  const statusTabs: Array<{
    id: ContributionProposalStatus | "ALL";
    label: string;
  }> = [
    { id: "ALL", label: "الكل" },
    { id: "PENDING", label: "قيد المراجعة" },
    { id: "ACCEPTED", label: "مقبول" },
    { id: "DECLINED", label: "مرفوض" },
    { id: "WITHDRAWN", label: "مسحوب" },
  ];
  const visibleProposals =
    activeStatus === "ALL"
      ? proposals
      : proposals.filter((proposal) => proposal.status === activeStatus);

  return (
    <div>
      <div
        role="tablist"
        aria-label="حالات مقترحات المساهمة"
        className="mb-4 flex gap-1 overflow-x-auto border-b border-border"
      >
        {statusTabs.map((tab) => {
          const count =
            tab.id === "ALL"
              ? proposals.length
              : proposals.filter((proposal) => proposal.status === tab.id)
                  .length;
          const selected = tab.id === activeStatus;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveStatus(tab.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
                selected
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span className="rounded-full bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="max-h-[calc(100dvh-18rem)] overflow-y-auto overscroll-contain pe-1"
      >
        {visibleProposals.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            لا توجد مقترحات في هذا القسم.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleProposals.map((proposal) => {
              const status = PROPOSAL_STATUS_META[proposal.status];
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
                          من{" "}
                          {formatProposerLabel(
                            proposal.proposerName,
                            proposal.proposerUsername,
                          )}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        النسخة {proposal.currentVersion} ·{" "}
                        {formatProposalDate(proposal.updatedAt)}
                      </p>
                    </div>
                    <StatusChip tone={status.tone} icon={status.icon}>
                      {status.label}
                    </StatusChip>
                  </div>
                  {proposal.revisionRequestedAt &&
                    proposal.status === "PENDING" && (
                      <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                        يوجد طلب مراجعة ينتظر نسخة جديدة من المساهم.
                      </p>
                    )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

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
            تحميل المزيد
          </Button>
        </div>
      )}
    </div>
  );
}
