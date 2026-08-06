import { Inbox } from "lucide-react";

import { Card } from "@/shared/components/ui/card";

import { getProposalErrorMessage } from "../constants/proposal-copy";
import { useProjectContributionProposalsQuery } from "../api/queries/use-contribution-proposal-queries";
import { ProposalListView } from "./proposal-list-view";

export function OwnerProposalWorkspace({ projectId }: { projectId: string }) {
  const query = useProjectContributionProposalsQuery(projectId);
  const proposals = query.data?.pages.flatMap((page) => page.proposals) ?? [];
  // A failed *next* page keeps `data` populated, so route it to the inline
  // load-more error instead of the terminal state that replaces the whole list.
  const hasLoadedAnyPage = query.data !== undefined;
  const message = query.isError ? getProposalErrorMessage(query.error) : null;

  return (
    <Card>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">مقترحات المساهمين الخاصة</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            راجع النسخ الأصلية واطلب تعديلًا أو اقبلها كمسودة منسوبة أو اعتذر بسبب واضح.
          </p>
        </div>
      </div>
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
