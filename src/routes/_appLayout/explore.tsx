import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { requireMemberRoute } from "@/modules/auth";
import {
  useContributorFieldsQuery,
} from "@/modules/contributors";
import {
  ExploreView,
  useProjectCategoriesQuery,
  useProjectDifficultiesQuery,
} from "@/modules/projects";
import type {
  ExploreSearchParamsDto,
  ProjectCategory,
  ProjectDifficulty,
} from "@/modules/projects";

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
  if (typeof search.category === "string" && search.category.length > 0) {
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
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const categoriesQuery = useProjectCategoriesQuery();
  const fieldsQuery = useContributorFieldsQuery();
  const difficultiesQuery = useProjectDifficultiesQuery();

  const dynamicCategories = useMemo(() => {
    const map = new Map<string, { key: string; labelAr: string; labelEn: string }>();
    for (const category of categoriesQuery.data ?? []) {
      map.set(category.key, category);
    }
    return Array.from(map.values()).map((cat) => ({
      key: cat.key,
      label: isArabic ? cat.labelAr : cat.labelEn,
    }));
  }, [categoriesQuery.data, isArabic]);

  const dynamicTechnologies = useMemo(() =>
    (fieldsQuery.data ?? []).map((field) => field.labelEn || field.key),
  [fieldsQuery.data]);

  const dynamicDifficulties = useMemo(() => {
    return (difficultiesQuery.data ?? []).map((difficulty) => ({
      key: difficulty.key,
      label: isArabic ? difficulty.labelAr : difficulty.labelEn,
    }));
  }, [difficultiesQuery.data, isArabic]);

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
      categories={dynamicCategories}
      technologies={dynamicTechnologies}
      difficulties={dynamicDifficulties}
    />
  );
}
