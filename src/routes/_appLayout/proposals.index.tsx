import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import {
  getProposalErrorMessage,
  ProposalListView,
  useMyContributionProposalsQuery,
} from "@/modules/contribution-proposals";

export const Route = createFileRoute("/_appLayout/proposals/")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "مقترحاتي | Sharek" }] }),
  component: MyProposalsPage,
});

function MyProposalsPage() {
  const query = useMyContributionProposalsQuery();
  const proposals = query.data?.pages.flatMap((page) => page.proposals) ?? [];
  // A failed *next* page keeps `data` populated, so route it to the inline
  // load-more error instead of the terminal state that replaces the whole list.
  const hasLoadedAnyPage = query.data !== undefined;
  const message = query.isError ? getProposalErrorMessage(query.error) : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">مقترحاتي</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          تابع النسخ الخاصة وطلبات المراجعة وقرارات أصحاب المشاريع في مكان واحد.
        </p>
      </header>
      <ProposalListView
        proposals={proposals}
        role="contributor"
        isLoading={query.isPending}
        error={hasLoadedAnyPage ? null : message}
        loadMoreError={hasLoadedAnyPage ? message : null}
        onRetry={() => void query.refetch()}
        hasNextPage={query.hasNextPage}
        isLoadingMore={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </div>
  );
}
