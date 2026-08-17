import {
  Calendar,
  ChevronDown,
  CircleAlert,
  Clock,
  Compass,
  FolderGit2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { StatValue } from "@/shared/components/data-display/stat";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { SearchField } from "@/shared/components/ui/search-field";

import { useContributionRequestsQuery } from "../api/queries/use-contribution-requests-query";
import {
  getContributionRequestDifficulties,
  getContributionRequestDifficultyLabel,
  formatContributionDate,
  formatContributionDateTime,
  formatContributionReward,
} from "../utils/contributor-presentation";
import type {
  ContributionRequestTechnologyFacetDto,
  ContributionRequestDifficulty,
  ContributionRequestFeedFiltersDto,
  ContributionRequestListItemDto,
} from "../types/contribution-request.types";

const POPULAR_REQUEST_TECH: string[] = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "WebSocket",
  "Docker",
];

interface FeedViewProps {
  filters: ContributionRequestFeedFiltersDto;
  onFiltersChange: (
    partial: Partial<ContributionRequestFeedFiltersDto>,
  ) => void;
  onReset: () => void;
  requestHref: (requestId: string) => string;
}

export function ContributionRequestFeedView({
  filters,
  onFiltersChange,
  onReset,
  requestHref,
}: FeedViewProps) {
  const { t } = useTranslation();
  const query = useContributionRequestsQuery(filters);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  const selectedTechnologies = filters.technologies ?? [];
  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...selectedTechnologies.map((tech) => ({
      key: `tech-${tech}`,
      label: tech,
      remove: () =>
        onFiltersChange({
          technologies:
            selectedTechnologies.filter((item) => item !== tech).length > 0
              ? selectedTechnologies.filter((item) => item !== tech)
              : undefined,
        }),
    })),
    ...(filters.difficulty !== undefined
      ? [
          {
            key: "difficulty",
            label: getContributionRequestDifficultyLabel(filters.difficulty),
            remove: () => onFiltersChange({ difficulty: undefined }),
          },
        ]
      : []),
    ...(filters.hasReward !== undefined
      ? [
          {
            key: "hasReward",
            label: filters.hasReward
              ? t("tasks.withReward")
              : t("tasks.withoutReward"),
            remove: () => onFiltersChange({ hasReward: undefined }),
          },
        ]
      : []),
  ];

  const activeFilterCount = activeChips.length + (filters.q ? 1 : 0);

  function reset() {
    setSearchDraft("");
    onReset();
  }

  function toggleHeroTech(tech: string) {
    const exists = selectedTechnologies.some(
      (item) => item.toLowerCase() === tech.toLowerCase(),
    );
    if (exists) {
      const next = selectedTechnologies.filter(
        (item) => item.toLowerCase() !== tech.toLowerCase(),
      );
      onFiltersChange({
        technologies: next.length > 0 ? next : undefined,
      });
    } else {
      onFiltersChange({
        technologies: [...selectedTechnologies, tech],
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
      {/* ── Signature Brand Hero Banner ── */}
      <header className="sk-hero px-6 py-8 md:px-10 md:py-10">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-evidence-teal">
          <Compass className="size-3.5" aria-hidden />
          <span>{t("explore.registryLabel", "سجل طلبات المساهمة المفتوحة")}</span>
        </div>

        <h1 className="mt-2.5 max-w-2xl text-balance text-2xl font-extrabold leading-[1.15] tracking-tight text-hero-ink sm:text-3xl md:text-4xl">
          {t("tasks.title")}
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-[14.5px] leading-relaxed text-hero-ink-soft sm:text-[15px]">
          {t("tasks.description")}
        </p>

        {/* Integrated Hero Search */}
        <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            className="min-w-0 flex-1"
            value={searchDraft}
            onChange={setSearchDraft}
            searchLabel={t("tasks.search")}
            clearSearchLabel={t("tasks.clearSearch")}
            searchButtonLabel={t("tasks.searchButton")}
            placeholder={t("tasks.searchPlaceholder")}
            tone="hero"
            onSearch={() =>
              onFiltersChange({ q: searchDraft.trim() || undefined })
            }
            onClear={() => {
              setSearchDraft("");
              onFiltersChange({ q: undefined });
            }}
          />
        </div>

        {/* Hero Quick Technology Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-hero-ink-soft">
            <Sparkles className="size-3 text-evidence-teal" />
            <span>{t("tasks.quickPresets", "شائع:")}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_REQUEST_TECH.map((tech) => {
              const isSelected = selectedTechnologies.some(
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

      {/* ── Main Content Grid ── */}
      <div className="mt-8 flex flex-col items-start gap-8 lg:flex-row">
        {/* Filter Panel (Desktop Sidebar & Mobile Accordion/Sheet) */}
        <div className="w-full shrink-0 lg:w-64">
          <ContributionRequestFilters
            filters={filters}
            technologyFacets={query.data?.technologyFacets ?? []}
            onChange={onFiltersChange}
            onReset={reset}
          />
        </div>

        {/* Results Stream */}
        <div className="min-w-0 flex-1 w-full">
          {/* Active Chips & Total Results Header */}
          <div className="flex min-h-10 flex-wrap items-center gap-2 border-b border-border pb-4">
            <p className="me-auto text-sm text-muted-foreground">
              <Trans
                i18nKey="tasks.available"
                count={query.data?.totalCount ?? 0}
                components={{
                  strong: <span className="tnum font-bold text-foreground" />,
                }}
              />
              {filters.q !== undefined && (
                <span className="text-muted-foreground">
                  {" "}
                  {t("explore.searchResultsFor", { query: filters.q })}
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

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
              >
                <RotateCcw className="size-3" />
                <span>{t("explore.clearAllFilters", "مسح الكل")}</span>
              </button>
            )}
          </div>

          <ContributionRequestResults
            isPending={query.isPending}
            isError={query.isError}
            isPlaceholderData={query.isPlaceholderData}
            items={query.data?.items ?? []}
            requestHref={requestHref}
            onRetry={() => void query.refetch()}
            onReset={reset}
          />
        </div>
      </div>
    </div>
  );
}

function ContributionRequestFilters({
  filters,
  technologyFacets,
  onChange,
  onReset,
}: {
  filters: ContributionRequestFeedFiltersDto;
  technologyFacets: ContributionRequestTechnologyFacetDto[];
  onChange: FeedViewProps["onFiltersChange"];
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const selectedTechnologies = filters.technologies ?? [];
  const activeFilterCount =
    selectedTechnologies.length +
    (filters.difficulty === undefined ? 0 : 1) +
    (filters.hasReward === undefined ? 0 : 1) +
    (filters.q ? 1 : 0);

  const controls = (
    <ContributionRequestFilterControls
      filters={filters}
      technologyFacets={technologyFacets}
      selectedTechnologies={selectedTechnologies}
      onChange={onChange}
      onReset={onReset}
    />
  );

  return (
    <>
      {/* Mobile Collapsible Drawer/Details */}
      <details className="group w-full rounded-card border border-border bg-card shadow-[var(--shadow-record)] lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 py-3.5 font-bold text-foreground transition-colors hover:bg-surface-fog focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>{t("tasks.filterResults")}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </div>
          <ChevronDown
            className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-border p-5">{controls}</div>
      </details>

      {/* Desktop Sticky Sidebar */}
      <aside className="sticky top-24 hidden h-fit w-full rounded-card border border-border bg-card p-5 shadow-[var(--shadow-record)] lg:block">
        <div className="mb-2 flex items-center justify-between border-b border-border pb-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>{t("tasks.filterResults")}</span>
          </h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
            >
              {t("tasks.resetFilters")}
            </button>
          )}
        </div>
        {controls}
      </aside>
    </>
  );
}

function ContributionRequestFilterControls({
  filters,
  technologyFacets,
  selectedTechnologies,
  onChange,
  onReset,
}: {
  filters: ContributionRequestFeedFiltersDto;
  technologyFacets: ContributionRequestTechnologyFacetDto[];
  selectedTechnologies: string[];
  onChange: FeedViewProps["onFiltersChange"];
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [facetSearch, setFacetSearch] = useState("");
  const [showAllFacets, setShowAllFacets] = useState(false);

  const filteredFacets = technologyFacets.filter(({ technology }) =>
    technology.toLowerCase().includes(facetSearch.toLowerCase().trim()),
  );
  const visibleFacets = showAllFacets
    ? filteredFacets
    : filteredFacets.slice(0, 8);

  const hasActiveFilters =
    selectedTechnologies.length > 0 ||
    filters.difficulty !== undefined ||
    filters.hasReward !== undefined;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Difficulty Filter */}
      <fieldset className="flex flex-col">
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
          {t("tasks.difficulty")}
        </legend>
        <NativeSelect
          aria-label={t("tasks.difficulty")}
          value={filters.difficulty ?? ""}
          size="sm"
          className="h-10 bg-background font-medium"
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              difficulty:
                value === ""
                  ? undefined
                  : (value as ContributionRequestDifficulty),
            });
          }}
        >
          <NativeSelectOption value="">
            {t("tasks.allDifficulties")}
          </NativeSelectOption>
          {getContributionRequestDifficulties().map(({ value, label }) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </fieldset>

      {/* 2. Reward Filter */}
      <fieldset className="flex flex-col">
        <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
          {t("tasks.reward")}
        </legend>
        <NativeSelect
          aria-label={t("tasks.reward")}
          value={
            filters.hasReward === undefined
              ? ""
              : filters.hasReward
                ? "with-reward"
                : "without-reward"
          }
          size="sm"
          className="h-10 bg-background font-medium"
          onChange={(event) => {
            const value = event.target.value;
            onChange({
              hasReward:
                value === "with-reward"
                  ? true
                  : value === "without-reward"
                    ? false
                    : undefined,
            });
          }}
        >
          <NativeSelectOption value="">
            {t("tasks.allRequests")}
          </NativeSelectOption>
          <NativeSelectOption value="with-reward">
            {t("tasks.withReward")}
          </NativeSelectOption>
          <NativeSelectOption value="without-reward">
            {t("tasks.withoutReward")}
          </NativeSelectOption>
        </NativeSelect>
      </fieldset>

      {/* 3. Technologies Facet List */}
      <fieldset className="flex flex-col">
        <div className="mb-2 flex items-center justify-between">
          <legend className="text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
            {t("tasks.technologies")}
          </legend>
          {selectedTechnologies.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ technologies: undefined })}
              className="text-[11px] font-semibold text-primary hover:opacity-80"
            >
              {t("explore.clearAllFilters", "مسح")}
            </button>
          )}
        </div>

        {technologyFacets.length > 6 && (
          <input
            type="text"
            value={facetSearch}
            onChange={(e) => setFacetSearch(e.target.value)}
            placeholder={t("tasks.searchPlaceholder", "تصفية التقنيات...")}
            className="mb-2 h-8 w-full rounded-md border border-border bg-background px-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        )}

        <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pe-1 [scrollbar-width:thin]">
          {visibleFacets.map(({ technology, count }) => {
            const checked = selectedTechnologies.includes(technology);
            return (
              <label
                key={technology}
                className={cn(
                  "flex min-h-8 cursor-pointer items-center justify-between rounded-md px-2 py-1 text-sm transition-colors",
                  checked
                    ? "bg-primary-soft/60 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-surface-fog hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const next =
                        isChecked === true
                          ? [...selectedTechnologies, technology]
                          : selectedTechnologies.filter(
                              (item) => item !== technology,
                            );
                      onChange({
                        technologies: next.length > 0 ? next : undefined,
                      });
                    }}
                  />
                  <bdi dir="ltr" className="font-mono text-xs">
                    {technology}
                  </bdi>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/80">
                  ({count})
                </span>
              </label>
            );
          })}

          {technologyFacets.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">
              {t("tasks.noTechnologies")}
            </p>
          )}
        </div>

        {filteredFacets.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllFacets((prev) => !prev)}
            className="mt-2 text-start text-xs font-semibold text-primary hover:underline"
          >
            {showAllFacets
              ? t("common.showLess", "عرض أقل")
              : t("common.showMore", `عرض المزيد (${filteredFacets.length - 8})`)}
          </button>
        )}
      </fieldset>

      {/* Reset Action */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!hasActiveFilters}
        onClick={onReset}
        className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
      >
        <RotateCcw className="size-3.5" />
        <span>{t("tasks.resetFilters")}</span>
      </Button>
    </div>
  );
}

function ContributionRequestResults({
  isPending,
  isError,
  isPlaceholderData,
  items,
  requestHref,
  onRetry,
  onReset,
}: {
  isPending: boolean;
  isError: boolean;
  isPlaceholderData: boolean;
  items: ContributionRequestListItemDto[];
  requestHref: FeedViewProps["requestHref"];
  onRetry: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  if (isPending) {
    return (
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-card border border-border bg-card p-6 shadow-[var(--shadow-record)]"
          >
            <div className="flex items-center justify-between">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton mt-4 h-6 w-3/4" />
            <div className="mt-4 flex gap-2">
              <div className="skeleton h-6 w-16 rounded-md" />
              <div className="skeleton h-6 w-20 rounded-md" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="skeleton h-8 w-full" />
              <div className="skeleton h-8 w-full" />
            </div>
            <div className="skeleton mt-4 h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-card border border-destructive/30 bg-card p-10 text-center shadow-[var(--shadow-record)] sm:p-14">
        <CircleAlert className="mb-3 size-10 text-destructive" />
        <h3 className="text-lg font-bold text-foreground">
          {t("tasks.loadError")}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {t("tasks.loadErrorDescription")}
        </p>
        <Button size="sm" className="mt-5" onClick={onRetry}>
          {t("common.retry", "إعادة المحاولة")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card p-10 text-center shadow-[var(--shadow-record)] sm:p-14">
        <Compass className="mb-3 size-10 text-muted-foreground opacity-60" />
        <h3 className="text-lg font-bold text-foreground">
          {t("tasks.noMatch")}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {t("tasks.noMatchDescription")}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="mt-5"
        >
          <RotateCcw className="size-3.5" />
          <span>{t("tasks.showAll")}</span>
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-live="polite"
      className={cn(
        "mt-6 grid gap-5 xl:grid-cols-2",
        isPlaceholderData && "opacity-60",
      )}
    >
      {items.map((request) => (
        <ContributionRequestCard
          key={request.id}
          request={request}
          requestHref={requestHref}
        />
      ))}
    </section>
  );
}

function ContributionRequestCard({
  request,
  requestHref,
}: {
  request: ContributionRequestListItemDto;
  requestHref: FeedViewProps["requestHref"];
}) {
  const { t, i18n } = useTranslation();
  const reward = request.reward;
  const locale = i18n.language.startsWith("en") ? "en-US" : "ar-EG";

  return (
    <Card
      interactive
      spine="active"
      padding="none"
      className="group flex h-full flex-col justify-between overflow-hidden border border-border bg-card shadow-[var(--shadow-record)] transition-all duration-200 hover:border-border-strong"
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Top Context: Project Name & Difficulty Chip */}
        <div className="flex items-start justify-between gap-3">
          <a
            href={`/projects/${request.projectSlug}`}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary transition-colors hover:underline"
          >
            <FolderGit2 className="size-3.5 text-primary" aria-hidden />
            <span className="truncate max-w-[200px] sm:max-w-[280px]">
              {request.projectName}
            </span>
          </a>

          {request.difficulty && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                request.difficulty === "beginner" &&
                  "border border-evidence-teal/30 bg-evidence-soft text-evidence-soft-foreground",
                request.difficulty === "intermediate" &&
                  "border border-primary/20 bg-primary-soft text-primary-soft-foreground",
                request.difficulty === "advanced" &&
                  "border border-review-amber/30 bg-review-amber-soft text-review-amber",
              )}
            >
              {getContributionRequestDifficultyLabel(request.difficulty)}
            </span>
          )}
        </div>

        {/* Request Title */}
        <h2 className="bidi mt-3 text-pretty text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          <a href={requestHref(request.id)} className="hover:underline">
            {request.title}
          </a>
        </h2>

        {/* Tech Stack Pills */}
        {request.technologyTags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {request.technologyTags.map((technology) => (
              <span
                key={technology}
                dir="ltr"
                className="rounded-md border border-border bg-surface-fog px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary/30"
              >
                {technology}
              </span>
            ))}
          </div>
        )}

        {/* Decision Constraints: Deadline & Target Completion */}
        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-xs">
          <Metadata
            icon={Clock}
            label={t("tasks.deadline")}
            value={formatContributionDateTime(request.applicationsCloseAt)}
          />
          <Metadata
            icon={Calendar}
            label={t("tasks.targetCompletion")}
            value={formatContributionDate(request.targetCompletionDate)}
          />
        </dl>
      </div>

      {/* Footer: Stated Reward & Action Button */}
      <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-fog px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
            {t("tasks.reward")}
          </p>
          <div className="mt-0.5 flex items-baseline gap-1" dir="ltr">
            {reward ? (
              <StatValue
                value={reward.amount.toLocaleString(locale)}
                unit={reward.currency}
                size="md"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {formatContributionReward(reward)}
              </span>
            )}
          </div>
        </div>

        <Button asChild size="sm" className="shrink-0 font-semibold">
          <a href={requestHref(request.id)}>
            <span>{t("tasks.viewRequest")}</span>
            <DirectionalArrow className="transition-transform duration-200 ease-out group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function Metadata({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 truncate text-[11px] font-medium text-subtle-foreground">
        <Icon className="size-3 text-muted-foreground" />
        <span>{label}</span>
      </dt>
      <dd className="tnum mt-0.5 truncate text-[12.5px] font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
