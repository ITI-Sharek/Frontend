import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

import { useExploreProjectsQuery } from "../api/queries/use-explore-projects-query";
import {
  ExploreFilters,
  getCategoryLabel,
  getDifficultyLabel,
} from "./explore-filters";
import { ExploreProjectCard } from "./explore-project-card";
import type { ExploreSearchParamsDto } from "../types/explore.types";

interface ExploreViewProps {
  params: ExploreSearchParamsDto;
  /** The route owns the URL (WF-03: all filters live in search params). */
  onParamsChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
}

/**
 * WF-03 project discovery: keyword search, filters (desktop sidebar /
 * mobile sheet), active-filter chips, result count + pagination, uniform
 * comparison cards, loading + filtered-empty states.
 */
export function ExploreView({ params, onParamsChange, onReset }: ExploreViewProps) {
  const { t } = useTranslation();
  const exploreQuery = useExploreProjectsQuery(params);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(params.q ?? "");

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...(params.technologies ?? []).map((tech) => ({
      key: `tech-${tech}`,
      label: tech,
      remove: () =>
        onParamsChange({
          technologies:
            (params.technologies ?? []).filter((item) => item !== tech).length > 0
              ? (params.technologies ?? []).filter((item) => item !== tech)
              : undefined,
        }),
    })),
    ...(params.category !== undefined
      ? [
          {
            key: "category",
            label: getCategoryLabel(t, params.category),
            remove: () => onParamsChange({ category: undefined }),
          },
        ]
      : []),
    ...(params.difficulty !== undefined
      ? [
          {
            key: "difficulty",
            label: getDifficultyLabel(t, params.difficulty),
            remove: () => onParamsChange({ difficulty: undefined }),
          },
        ]
      : []),
  ];
  const filtersCount = activeChips.length;
  const result = exploreQuery.data;
  const pagination = result?.pagination;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <h1 className="text-2xl font-bold text-foreground">{t("explore.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("explore.description")}
      </p>

      <form
        className="mt-4 flex gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          onParamsChange({ q: searchDraft.trim() || undefined, page: undefined });
        }}
      >
        <label className="flex flex-1 items-center gap-2.5 rounded-input border border-border bg-card px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder={t("explore.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-input-placeholder"
          />
          {searchDraft !== "" && (
            <button
              type="button"
              aria-label={t("explore.clearSearch")}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchDraft("");
                onParamsChange({ q: undefined, page: undefined });
              }}
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 rounded-input border border-border bg-card px-4 text-sm font-medium text-foreground lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          {t("explore.filtersButton")}
          {filtersCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] leading-none text-primary-foreground">
              {filtersCount}
            </span>
          )}
        </button>
      </form>

      <div className="mt-5 flex items-start gap-6">
        <aside className="hidden w-56 shrink-0 rounded-card border border-border bg-card px-4 py-1 lg:block">
          <ExploreFilters params={params} onChange={onParamsChange} onReset={onReset} />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-foreground">
              <b>{pagination?.total ?? "…"}</b>{" "}
              {t("project.results.matchingProjects")}
              {params.q !== undefined && (
                <span className="text-muted-foreground">
                  {" "}
                  {t("explore.searchResultsFor", { query: params.q })}
                </span>
              )}
            </p>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.remove}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:border-primary/50"
              >
                <bdi>{chip.label}</bdi>
                <X className="size-3 text-muted-foreground" />
              </button>
            ))}
            {filtersCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-primary hover:opacity-80"
              >
                {t("explore.clearAllFilters")}
              </button>
            )}
          </div>

          {exploreQuery.isPending ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="rounded-card border border-border bg-card p-5">
                  <div className="h-3.5 w-2/5 rounded bg-border/50" />
                  <div className="mt-3 h-3 w-full rounded bg-border/40" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-border/40" />
                  <div className="mt-4 h-1.5 w-full rounded bg-border/30" />
                </div>
              ))}
            </div>
          ) : result !== undefined && result.projects.length > 0 ? (
            <>
              <div
                className={cn(
                  "mt-4 grid gap-4 xl:grid-cols-2",
                  exploreQuery.isPlaceholderData && "opacity-60",
                )}
              >
                {result.projects.map((project) => (
                  <ExploreProjectCard key={project.id} project={project} />
                ))}
              </div>
              {pagination !== undefined && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => onParamsChange({ page: pagination.page - 1 })}
                    className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                    {t("explore.previousPage")}
                  </button>
                  <span className="font-mono text-xs tracking-[0.65px] text-muted-foreground">
                    {t("explore.page", {
                      current: pagination.page,
                      total: pagination.totalPages,
                    })}
                  </span>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => onParamsChange({ page: pagination.page + 1 })}
                    className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                  >
                    {t("explore.nextPage")}
                    <ChevronLeft className="size-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-card border border-dashed border-border bg-card p-10 text-center">
              <p className="font-bold text-foreground">{t("explore.noMatch")}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("explore.noMatchDescription")}
              </p>
              <Button size="sm" variant="outline" className="mt-4" onClick={onReset}>
                {t("explore.resetFiltersButton")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("explore.closeFiltersAriaLabel")}
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-5 pb-8">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{t("explore.filtersTitle")}</h2>
              <button
                type="button"
                className="text-sm text-primary"
                onClick={onReset}
              >
                {t("explore.resetFilters")}
              </button>
            </div>
            <ExploreFilters params={params} onChange={onParamsChange} onReset={onReset} />
            <Button className="mt-2 w-full" onClick={() => setSheetOpen(false)}>
              {t("explore.viewProjects", { count: pagination?.total ?? 0 })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
