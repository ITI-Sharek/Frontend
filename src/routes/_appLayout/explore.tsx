import { createFileRoute } from "@tanstack/react-router";

import { requireMemberRoute } from "@/modules/auth";
import { ExploreView } from "@/modules/projects";
import type {
  ExploreSearchParamsDto,
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

/** WF-03: all filters/search/page live in the URL (shareable, back-navigable). */
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
  const page = Number(search.page);
  if (Number.isInteger(page) && page > 1) {
    params.page = page;
  }

  return params;
}

export const Route = createFileRoute("/_appLayout/explore")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch,
  component: ExplorePage,
});

function ExplorePage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();

  function applyParams(partial: Partial<ExploreSearchParamsDto>) {
    const next = { ...params, ...partial };
    // Any filter/search change other than an explicit page change starts back at page 1.
    if (!("page" in partial)) {
      next.page = undefined;
    }
    void navigate({
      search: {
        q: next.q,
        technologies: next.technologies,
        category: next.category,
        difficulty: next.difficulty,
        page: next.page,
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
