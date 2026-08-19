import { createFileRoute } from "@tanstack/react-router";

import { requireMemberRoute } from "@/modules/auth";
import { ExploreContributorsView } from "@/modules/contributors";
import type { ContributorDirectorySearchParamsDto } from "@/modules/contributors";

function validateSearch(search: Record<string, unknown>): ContributorDirectorySearchParamsDto {
  const params: ContributorDirectorySearchParamsDto = {};
  if (typeof search.q === "string" && search.q.trim() !== "") params.q = search.q;
  const page = Number(search.page);
  if (Number.isInteger(page) && page > 1) params.page = page;
  return params;
}

export const Route = createFileRoute("/_appLayout/explore/contributor")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Explore Contributors | Sharek" }] }),
  validateSearch,
  component: ExploreContributorsPage,
});

function ExploreContributorsPage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();

  function applyParams(partial: ContributorDirectorySearchParamsDto) {
    const next = { ...params, ...partial };
    if (!("page" in partial)) next.page = undefined;
    void navigate({ search: { q: next.q, page: next.page }, replace: true });
  }

  return (
    <ExploreContributorsView
      params={params}
      onParamsChange={applyParams}
      onReset={() => void navigate({ search: {}, replace: true })}
    />
  );
}
