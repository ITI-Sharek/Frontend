import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { SearchField } from "@/shared/components/ui/search-field";
import { ExploreCategoryTiles } from "./explore-category-tiles";
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
export function ExploreView({
  params,
  onParamsChange,
  onReset,
}: ExploreViewProps) {
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
            (params.technologies ?? []).filter((item) => item !== tech).length >
            0
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
    <div className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
      {/*
       * The registry opens on a brand band carrying the search, the way a
       * marketplace front page does — search is the primary act here, so it
       * gets the strongest surface rather than sitting as one more grey input
       * under a heading.
       */}
      <header className="sk-hero px-5 py-8 md:px-9 md:py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-evidence-teal">
          {t("explore.registryLabel")}
        </p>
        <h1 className="mt-2.5 max-w-2xl text-balance text-[28px] font-extrabold leading-[1.12] tracking-tight text-hero-ink md:text-[40px]">
          {t("explore.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-7 text-hero-ink-soft">
          {t("explore.description")}
        </p>

        <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:items-start">
          <SearchField
            className="min-w-0 flex-1"
            value={searchDraft}
            onChange={setSearchDraft}
            searchLabel={t("explore.search")}
            clearSearchLabel={t("explore.clearSearch")}
            searchButtonLabel={t("explore.searchButton")}
            placeholder={t("explore.searchPlaceholder")}
            tone="hero"
            onSearch={() =>
              onParamsChange({
                q: searchDraft.trim() || undefined,
                page: undefined,
              })
            }
            onClear={() => {
              setSearchDraft("");
              onParamsChange({ q: undefined, page: undefined });
            }}
          />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-bold text-hero-ink backdrop-blur-sm transition-colors hover:bg-white/20 sm:w-auto lg:hidden"
          >
            <SlidersHorizontal className="size-4" />
            {t("explore.filtersButton")}
            {filtersCount > 0 && (
              <span className="tnum rounded-full bg-evidence-teal px-1.5 py-0.5 text-[10px] font-bold leading-none text-evidence-teal-foreground">
                {filtersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Coarse filter first, as a picture row. */}
      <div className="mt-7">
        <ExploreCategoryTiles
          active={params.category}
          onSelect={(category) => onParamsChange({ category, page: undefined })}
        />
      </div>

      <div className="mt-7 flex items-start gap-7">
        <aside className="sticky top-24 hidden w-60 shrink-0 rounded-card border border-border bg-surface-fog px-4 py-1 lg:block">
          <ExploreFilters
            params={params}
            onChange={onParamsChange}
            onReset={onReset}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-border pb-4">
            <p className="me-auto text-sm text-muted-foreground">
              {/*
               * The locale string emphasises the count with a <b> tag. Passing
               * it through `t()` rendered the tag as literal text ("<b>4</b>
               * matching projects"); <Trans> is what actually maps it to an
               * element.
               */}
              <Trans
                i18nKey="explore.totalResults"
                count={pagination?.total ?? 0}
                components={{
                  b: <span className="tnum font-bold text-foreground" />,
                }}
              />
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
                <div
                  key={index}
                  className="rounded-card border border-border bg-card p-5"
                >
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
                  "mt-5 grid gap-4 xl:grid-cols-2",
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
                    onClick={() =>
                      onParamsChange({ page: pagination.page - 1 })
                    }
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
                    onClick={() =>
                      onParamsChange({ page: pagination.page + 1 })
                    }
                    className="inline-flex items-center gap-1 rounded-input border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
                  >
                    {t("explore.nextPage")}
                    <ChevronLeft className="size-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-5 rounded-card border border-dashed border-border bg-card p-10 text-center">
              <p className="font-bold text-foreground">
                {t("explore.noMatch")}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("explore.noMatchDescription")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={onReset}
              >
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
              <h2 className="text-lg font-bold text-foreground">
                {t("explore.filtersTitle")}
              </h2>
              <button
                type="button"
                className="text-sm text-primary"
                onClick={onReset}
              >
                {t("explore.resetFilters")}
              </button>
            </div>
            <ExploreFilters
              params={params}
              onChange={onParamsChange}
              onReset={onReset}
            />
            <Button className="mt-2 w-full" onClick={() => setSheetOpen(false)}>
              {t("explore.viewProjects", { count: pagination?.total ?? 0 })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
