import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import i18n from "@/lib/i18n";
import { requireContributorRoute } from "@/modules/auth";
import {
  getProposalErrorMessage,
  ProposalListView,
  useMyContributionProposalsQuery,
} from "@/modules/contribution-proposals";

export const Route = createFileRoute("/_appLayout/proposals/")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: i18n.t("pageTitle.proposals") }] }),
  component: MyProposalsPage,
});

function MyProposalsPage() {
  const { t } = useTranslation();
  const query = useMyContributionProposalsQuery();
  const proposals = query.data?.pages.flatMap((page) => page.proposals) ?? [];
  // A failed *next* page keeps `data` populated, so route it to the inline
  // load-more error instead of the terminal state that replaces the whole list.
  const hasLoadedAnyPage = query.data !== undefined;
  const message = query.isError
    ? getProposalErrorMessage(t, query.error)
    : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">{t("proposals.title")}</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          {t("proposals.description")}
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
