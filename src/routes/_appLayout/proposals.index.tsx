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

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">مقترحاتي</h1>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          تابع النسخ الخاصة وطلبات المراجعة وقرارات أصحاب المشاريع في مكان واحد.
        </p>
      </header>
      <ProposalListView
        proposals={query.data?.proposals ?? []}
        role="contributor"
        isLoading={query.isPending}
        error={query.isError ? getProposalErrorMessage(query.error) : null}
        onRetry={() => void query.refetch()}
      />
    </div>
  );
}
