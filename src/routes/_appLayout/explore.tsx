import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import { ExploreView } from "@/modules/projects";
import type {
  ExploreSearchParamsDto,
  ExploreSortKey,
  ProjectCategory,
  ProjectDifficulty,
} from "@/modules/projects";

const CATEGORIES: ProjectCategory[] = [
  "web",
  "mobile",
  "ai_ml",
  "devops",
  "tools_utilities",
];
const DIFFICULTIES: ProjectDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];
const SORT_KEYS: ExploreSortKey[] = [
  "newest",
  "best_fit",
  "most_active",
  "open_tasks",
];

/** WF-03: all filters/search/sort live in the URL (shareable, back-navigable). */
function validateSearch(search: Record<string, unknown>): ExploreSearchParamsDto {
  const params: ExploreSearchParamsDto = {};

  if (typeof search.q === "string" && search.q.trim() !== "") {
    params.q = search.q;
  }
  const tech = search.technologies;
  if (typeof tech === "string") {
    params.technologies = [tech];
  } else if (
    Array.isArray(tech) &&
    tech.every((item): item is string => typeof item === "string")
  ) {
    if (tech.length > 0) params.technologies = tech;
  }
  if (CATEGORIES.includes(search.category as ProjectCategory)) {
    params.category = search.category as ProjectCategory;
  }
  if (DIFFICULTIES.includes(search.difficulty as ProjectDifficulty)) {
    params.difficulty = search.difficulty as ProjectDifficulty;
  }
  if (SORT_KEYS.includes(search.sort as ExploreSortKey)) {
    params.sort = search.sort as ExploreSortKey;
  }

  return params;
}

export const Route = createFileRoute("/_appLayout/explore")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "استكشاف المشاريع | Sharek" }] }),
  validateSearch,
  component: ExplorePage,
});

function ExplorePage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();

  function applyParams(partial: Partial<ExploreSearchParamsDto>) {
    const next = { ...params, ...partial };
    void navigate({
      search: {
        q: next.q,
        technologies: next.technologies,
        category: next.category,
        difficulty: next.difficulty,
        sort: next.sort,
      },
      replace: true,
    });
  }

  return (
    <ExploreView
      params={params}
      onParamsChange={applyParams}
      onReset={() => void navigate({ search: {}, replace: true })}
    />
  );
}
