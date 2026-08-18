import {
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { SearchField } from "@/shared/components/ui/search-field";
import { ExploreCategoryTiles } from "./explore-category-tiles";
import { cn } from "@/lib/utils";

import {
  ExploreFilters,
  ExploreTopFilterBar,
  POPULAR_TECHNOLOGIES,
} from "./explore-filters";
import type { DynamicFilterOption } from "./explore-filters";
import { ExploreProjectCard } from "./explore-project-card";
import { useExploreProjectsQuery } from "../api/queries/use-explore-projects-query";
import type { ExploreSearchParamsDto } from "../types/explore.types";

interface ExploreViewProps {
  params: ExploreSearchParamsDto;
  /** The route owns the URL (WF-03: all filters live in search params). */
  onParamsChange: (partial: Partial<ExploreSearchParamsDto>) => void;
  onReset: () => void;
  categories?: DynamicFilterOption[];
  technologies?: string[];
  difficulties?: DynamicFilterOption[];
}

/**
 * WF-03 project discovery: keyword search, category tiles, top filtration toolbar,
 * multi-grid view switcher (1, 2, 3 columns), uniform comparison cards,
 * loading + filtered-empty states.
 */
export function ExploreView({
  params,
  onParamsChange,
  onReset,
  categories,
  technologies,
  difficulties,
}: ExploreViewProps) {
  const { t } = useTranslation();
  const exploreQuery = useExploreProjectsQuery(params);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(params.q ?? "");
  const [viewMode, setViewMode] = useState<"1" | "2" | "3">("3");

  const result = exploreQuery.data;
  const pagination = result?.pagination;
  const totalResults = pagination?.total ?? result?.projects.length ?? 0;

  const filtersCount =
    (params.technologies?.length ?? 0) +
    (params.category !== undefined ? 1 : 0) +
    (params.difficulty !== undefined ? 1 : 0) +
    (params.q ? 1 : 0);

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
    <div className="mx-auto w-full max-w-[1360px] px-4 py-6 md:px-6 md:py-8">
      {/* ── Signature Brand Hero Banner ── */}
      <header className="sk-hero px-6 py-8 md:px-12 md:py-12 rounded-3xl shadow-[var(--shadow-record)]">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-evidence-teal">
          <Layers className="size-4" aria-hidden />
          <span>{t("explore.registryLabel")}</span>
        </div>

        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black leading-[1.12] tracking-tight text-hero-ink sm:text-4xl md:text-5xl">
          {t("explore.title")}
        </h1>

        <p className="mt-3.5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-hero-ink-soft sm:text-lg">
          {t("explore.description")}
        </p>

        {/* Integrated Hero Search and Mobile Filter Trigger */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
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
              <span className="tnum rounded-full bg-evidence-teal px-2 py-0.5 text-xs font-bold leading-none text-evidence-teal-foreground">
                {filtersCount}
              </span>
            )}
          </button>
        </div>

        {/* Hero Quick Technology Tags */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm">
          <span className="flex items-center gap-1.5 font-bold text-hero-ink-soft">
            <Sparkles className="size-3.5 text-evidence-teal" />
            <span>{t("tasks.quickPresets", "شائع:")}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TECHNOLOGIES.slice(0, 8).map((tech) => {
              const isSelected = (params.technologies ?? []).some(
                (item) => item.toLowerCase() === tech.toLowerCase(),
              );
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleHeroTech(tech)}
                  className={cn(
                    "rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all shadow-2xs",
                    isSelected
                      ? "bg-evidence-teal text-evidence-teal-foreground shadow-sm scale-105"
                      : "border border-white/20 bg-white/10 text-hero-ink hover:bg-white/25",
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
          categories={categories}
        />
      </div>

      {/* ── Top Filtration Toolbar (Replacing Sidebar) ── */}
      <div className="mt-8">
        <ExploreTopFilterBar
          params={params}
          onChange={onParamsChange}
          onReset={onReset}
          categories={categories}
          technologies={technologies}
          difficulties={difficulties}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={totalResults}
        />
      </div>

      {/* ── Projects Grid Stream ── */}
      <div className="mt-6">
        {/* Loading Skeleton */}
        {exploreQuery.isPending ? (
          <div
            className={cn(
              "grid gap-5",
              viewMode === "1" && "grid-cols-1",
              viewMode === "2" && "grid-cols-1 md:grid-cols-2",
              viewMode === "3" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-record)] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="skeleton h-4 w-24 rounded-full" />
                  <div className="skeleton h-5 w-20 rounded-full" />
                </div>
                <div className="skeleton h-6 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-2/3 rounded-md" />
                <div className="skeleton h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-md" />
                  <div className="skeleton h-6 w-20 rounded-md" />
                </div>
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : result !== undefined && result.projects.length > 0 ? (
          <>
            {/* Project Card Grid */}
            <div
              className={cn(
                "grid gap-5 transition-all",
                viewMode === "1" && "grid-cols-1 gap-5",
                viewMode === "2" && "grid-cols-1 md:grid-cols-2 gap-6",
                viewMode === "3" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
                exploreQuery.isPlaceholderData && "opacity-60",
              )}
            >
              {result.projects.map((project) => (
                <ExploreProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination !== undefined && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => onParamsChange({ page: pagination.page - 1 })}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                >
                  <ChevronRight className="size-4" />
                  <span>{t("explore.previousPage")}</span>
                </button>

                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground px-2">
                  {t("explore.page", {
                    current: pagination.page,
                    total: pagination.totalPages,
                  })}
                </span>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onParamsChange({ page: pagination.page + 1 })}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                >
                  <span>{t("explore.nextPage")}</span>
                  <ChevronLeft className="size-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Filtered Empty State */
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-record)] sm:p-16">
            <img
              src="/art/empty-projects.png"
              alt=""
              width={96}
              height={96}
              className="mb-4 size-24 opacity-80"
            />
            <h3 className="text-xl font-black text-foreground sm:text-2xl">
              {t("explore.noMatch")}
            </h3>
            <p className="mt-2 max-w-md text-sm font-medium text-muted-foreground sm:text-base">
              {t("explore.noMatchDescription")}
            </p>
            <Button
              size="default"
              variant="outline"
              className="mt-6 gap-2 rounded-xl font-bold"
              onClick={onReset}
            >
              <RotateCcw className="size-4" />
              <span>{t("explore.resetFiltersButton")}</span>
            </Button>
          </div>
        )}
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
          <div className="absolute inset-x-0 bottom-0 max-h-[85%] overflow-y-auto rounded-t-3xl border-t border-border bg-background p-6 pb-8 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-extrabold text-foreground">
                {t("explore.filtersTitle")}
              </h2>
              <button
                type="button"
                className="text-sm font-bold text-primary"
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
                categories={categories}
                technologies={technologies}
                difficulties={difficulties}
              />
            </div>
            <Button
              className="mt-4 w-full rounded-xl font-extrabold text-base h-12"
              size="lg"
              onClick={() => setSheetOpen(false)}
            >
              {t("explore.viewProjects", { count: totalResults })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
