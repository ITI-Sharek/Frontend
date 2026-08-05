import { FilePlus2, RotateCcw } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import type { ContributionProposalSummaryDto } from "../types/contribution-proposal.types";
import {
  formatProposalDate,
  PROPOSAL_STATUS_META,
} from "../utils/proposal-presenter";

export function ProposalListView({
  proposals,
  role,
  isLoading,
  error,
  onRetry,
}: {
  proposals: ContributionProposalSummaryDto[];
  role: "owner" | "contributor";
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (isLoading) {
    return <p role="status" className="text-sm text-muted-foreground">جارٍ تحميل المقترحات…</p>;
  }

  if (error) {
    return (
      <Card>
        <p role="alert" className="text-sm text-destructive">{error}</p>
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={onRetry}>
          <RotateCcw className="size-4" /> إعادة المحاولة
        </Button>
      </Card>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <FilePlus2 className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-foreground">
          {role === "owner" ? "لا توجد مقترحات لهذا المشروع" : "لم ترسل مقترحات بعد"}
        </p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {role === "owner"
            ? "ستظهر هنا المقترحات الخاصة المرسلة إلى مشروعك."
            : "ابدأ من الصفحة العامة لمشروع منشور يقبل المقترحات."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const status = PROPOSAL_STATUS_META[proposal.status];
        return (
          <a
            key={proposal.id}
            href={ROUTES.proposal(proposal.id)}
            className="block rounded-card border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{proposal.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  النسخة {proposal.currentVersion} · {formatProposalDate(proposal.updatedAt)}
                </p>
              </div>
              <StatusChip tone={status.tone} icon={status.icon}>{status.label}</StatusChip>
            </div>
            {proposal.revisionRequestedAt && proposal.status === "PENDING" && (
              <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                يوجد طلب مراجعة ينتظر نسخة جديدة من المساهم.
              </p>
            )}
          </a>
        );
      })}
    </div>
  );
}
