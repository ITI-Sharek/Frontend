import {
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
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
  POPULAR_TECHNOLOGIES,
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
 * WF-03 project discovery: keyword search, category tiles, filters (desktop sidebar /
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

  const filtersCount = activeChips.length + (params.q ? 1 : 0);
  const result = exploreQuery.data;
  const pagination = result?.pagination;

  function toggleHeroTech(tech: string) {
    const current = params.technologies ?? [];
    const exists = current.some(
      (item) => item.toLowerCase() === tech.toLowerCase(),
    );
    if (exists) {
      const next = current.filter(
        (item) => item.toLowerCase() !== tech.toLowerCase(),
      );
      onParamsChange({
        technologies: next.length > 0 ? next : undefined,
        page: undefined,
      });
    } else {
      onParamsChange({
        technologies: [...current, tech],
        page: undefined,
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
      {/* ── Signature Brand Hero Banner ── */}
      <header className="sk-hero px-6 py-8 md:px-10 md:py-10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-evidence-teal">
          <Layers className="size-3.5" aria-hidden />
          <span>{t("explore.registryLabel")}</span>
        </div>

        <h1 className="mt-2.5 max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] tracking-tight text-hero-ink sm:text-3xl md:text-4xl">
          {t("explore.title")}
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-[14.5px] leading-relaxed text-hero-ink-soft sm:text-[15px]">
          {t("explore.description")}
        </p>

        {/* Integrated Hero Search and Mobile Filter Trigger */}
        <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
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
            <span>{t("explore.filtersButton")}</span>
            {filtersCount > 0 && (
              <span className="tnum rounded-full bg-evidence-teal px-1.5 py-0.5 text-[10px] font-bold leading-none text-evidence-teal-foreground">
                {filtersCount}
              </span>
            )}
          </button>
        </div>

        {/* Hero Quick Technology Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-hero-ink-soft">
            <Sparkles className="size-3 text-evidence-teal" />
            <span>{t("tasks.quickPresets", "شائع:")}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_TECHNOLOGIES.slice(0, 7).map((tech) => {
              const isSelected = (params.technologies ?? []).some(
                (item) => item.toLowerCase() === tech.toLowerCase(),
              );
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleHeroTech(tech)}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-all",
                    isSelected
                      ? "bg-evidence-teal font-bold text-evidence-teal-foreground shadow-sm"
                      : "border border-white/20 bg-white/10 text-hero-ink hover:bg-white/20",
                  )}
                >
                  <bdi>{tech}</bdi>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Category Selection Strip ── */}
      <div className="mt-8">
        <ExploreCategoryTiles
          active={params.category}
          onSelect={(category) => onParamsChange({ category, page: undefined })}
        />
      </div>

      {/* ── Main Explorer Content Grid ── */}
      <div className="mt-8 flex items-start gap-8">
        {/* Sticky Desktop Filter Sidebar */}
        <aside className="sticky top-24 hidden w-64 shrink-0 rounded-card border border-border bg-card p-5 shadow-[var(--shadow-record)] lg:block">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" />
              <span>{t("explore.filtersTitle")}</span>
            </h2>
            {filtersCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
              >
                {t("explore.resetFilters")}
              </button>
            )}
          </div>

          <ExploreFilters
            params={params}
            onChange={onParamsChange}
            onReset={onReset}
          />
        </aside>

        {/* Results Stream */}
        <div className="min-w-0 flex-1">
          {/* Active Chips & Total Results Header */}
          <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-border pb-4">
            <p className="me-auto text-sm text-muted-foreground">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:border-destructive/40 hover:bg-destructive-soft hover:text-destructive"
              >
                <bdi>{chip.label}</bdi>
                <X className="size-3 text-muted-foreground" />
              </button>
            ))}

            {filtersCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
              >
                <RotateCcw className="size-3" />
                <span>{t("explore.clearAllFilters")}</span>
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {exploreQuery.isPending ? (
            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="rounded-card border border-border bg-card p-6 shadow-[var(--shadow-record)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-5 w-16 rounded-full" />
                  </div>
                  <div className="skeleton mt-4 h-6 w-3/4" />
                  <div className="skeleton mt-2 h-4 w-full" />
                  <div className="skeleton mt-1.5 h-4 w-2/3" />
                  <div className="skeleton mt-5 h-2 w-full rounded-full" />
                  <div className="mt-4 flex gap-2">
                    <div className="skeleton h-6 w-16 rounded-md" />
                    <div className="skeleton h-6 w-20 rounded-md" />
                  </div>
                  <div className="skeleton mt-6 h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : result !== undefined && result.projects.length > 0 ? (
            <>
              {/* Project Card Grid */}
              <div
                className={cn(
                  "mt-6 grid gap-5 xl:grid-cols-2",
                  exploreQuery.isPlaceholderData && "opacity-60",
                )}
              >
                {result.projects.map((project) => (
                  <ExploreProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination !== undefined && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3 border-t border-border pt-6">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      onParamsChange({ page: pagination.page - 1 })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                    <span>{t("explore.previousPage")}</span>
                  </button>

                  <span className="font-mono text-xs tracking-wider text-muted-foreground">
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>{t("explore.nextPage")}</span>
                    <ChevronLeft className="size-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Filtered Empty State */
            <div className="mt-6 flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-record)] sm:p-14">
              <img
                src="/art/empty-projects.png"
                alt=""
                width={84}
                height={84}
                className="mb-4 size-20 opacity-80"
              />
              <h3 className="text-lg font-bold text-foreground">
                {t("explore.noMatch")}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                {t("explore.noMatchDescription")}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-5"
                onClick={onReset}
              >
                <RotateCcw className="size-3.5" />
                <span>{t("explore.resetFiltersButton")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Sheet ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("explore.closeFiltersAriaLabel")}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-6 pb-8 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {t("explore.filtersTitle")}
              </h2>
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={onReset}
              >
                {t("explore.resetFilters")}
              </button>
            </div>
            <div className="py-4">
              <ExploreFilters
                params={params}
                onChange={onParamsChange}
                onReset={onReset}
              />
            </div>
            <Button
              className="mt-4 w-full font-bold"
              size="lg"
              onClick={() => setSheetOpen(false)}
            >
              {t("explore.viewProjects", { count: pagination?.total ?? 0 })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
