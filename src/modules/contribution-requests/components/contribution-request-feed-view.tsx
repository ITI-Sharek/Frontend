import { CircleAlert, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

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

  function reset() {
    setSearchDraft("");
    onReset();
  }

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        title={t("tasks.title")}
        description={t("tasks.description")}
      />
      <ContributionRequestSearch
        value={searchDraft}
        onChange={setSearchDraft}
        onSearch={() =>
          onFiltersChange({ q: searchDraft.trim() || undefined })
        }
        onClear={() => {
          setSearchDraft("");
          onFiltersChange({ q: undefined });
        }}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <ContributionRequestFilters
          filters={filters}
          technologyFacets={query.data?.technologyFacets ?? []}
          onChange={onFiltersChange}
          onReset={reset}
        />
        <ContributionRequestResults
          isPending={query.isPending}
          isError={query.isError}
          isPlaceholderData={query.isPlaceholderData}
          items={query.data?.items ?? []}
          totalCount={query.data?.totalCount ?? 0}
          requestHref={requestHref}
          onRetry={() => void query.refetch()}
          onReset={reset}
        />
      </div>
    </PageContainer>
  );
}

function ContributionRequestSearch({
  value,
  onChange,
  onSearch,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <form
      className="mt-5 flex gap-2"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="flex min-h-11 flex-1 items-center gap-2 rounded-input border border-border bg-card px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background">
        <Search className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="sr-only">{t("tasks.search")}</span>
        <input
          value={value}
          placeholder={t("tasks.searchPlaceholder")}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-input-placeholder"
          onChange={(event) => onChange(event.target.value)}
        />
        {value !== "" && (
          <button
            type="button"
            aria-label={t("tasks.clearSearch")}
            className="inline-flex size-8 items-center justify-center rounded-input text-muted-foreground hover:bg-border/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClear}
          >
            <X className="size-4" />
          </button>
        )}
      </label>
      <Button type="submit">{t("tasks.searchButton")}</Button>
    </form>
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
  return (
    <aside className="h-fit rounded-card border border-border bg-card p-4">
      <h2 className="font-bold text-foreground">{t("tasks.filterResults")}</h2>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          {t("tasks.difficulty")}
        </legend>
        <select
          aria-label={t("tasks.difficulty")}
          value={filters.difficulty ?? ""}
          className="mt-2 min-h-11 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          <option value="">{t("tasks.allDifficulties")}</option>
          {getContributionRequestDifficulties().map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </select>
      </fieldset>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          {t("tasks.technologies")}
        </legend>
        <div className="mt-2 flex max-h-52 flex-col gap-2 overflow-y-auto">
          {technologyFacets.map(({ technology, count }) => (
            <label
              key={technology}
              className="flex min-h-8 items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                type="checkbox"
                checked={selectedTechnologies.includes(technology)}
                onChange={(event) => {
                  const next = event.target.checked
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
              {/* Says how far the filter narrows the list before it is
                  clicked, so an empty result reads as an honest zero rather
                  than a broken filter. */}
              <span className="text-xs text-muted-foreground/80">({count})</span>
            </label>
          ))}
          {technologyFacets.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {t("tasks.noTechnologies")}
            </p>
          )}
        </div>
      </fieldset>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          {t("tasks.reward")}
        </legend>
        <select
          aria-label={t("tasks.reward")}
          value={
            filters.hasReward === undefined
              ? ""
              : filters.hasReward
                ? "with-reward"
                : "without-reward"
          }
          className="mt-2 min-h-11 w-full rounded-input border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          <option value="">{t("tasks.allRequests")}</option>
          <option value="with-reward">{t("tasks.withReward")}</option>
          <option value="without-reward">{t("tasks.withoutReward")}</option>
        </select>
      </fieldset>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={onReset}
      >
        {t("tasks.resetFilters")}
      </Button>
    </aside>
  );
}

function ContributionRequestResults({
  isPending,
  isError,
  isPlaceholderData,
  items,
  totalCount,
  requestHref,
  onRetry,
  onReset,
}: {
  isPending: boolean;
  isError: boolean;
  isPlaceholderData: boolean;
  items: ContributionRequestListItemDto[];
  totalCount: number;
  requestHref: FeedViewProps["requestHref"];
  onRetry: () => void;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  if (isPending) {
    return (
      <PageFeedback
        icon={Loader2}
        title={t("tasks.loading")}
        description={t("tasks.loadingDescription")}
      />
    );
  }
  if (isError) {
    return (
      <PageFeedback
        icon={CircleAlert}
        title={t("tasks.loadError")}
        description={t("tasks.loadErrorDescription")}
        action={
          <Button size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        }
      />
    );
  }
  if (items.length === 0) {
    return (
      <PageFeedback
        title={t("tasks.noMatch")}
        description={t("tasks.noMatchDescription")}
        action={
          <Button variant="outline" size="sm" onClick={onReset}>
            {t("tasks.showAll")}
          </Button>
        }
      />
    );
  }
  return (
    <section aria-live="polite">
      <p className="mb-3 text-sm text-muted-foreground">
        {t("tasks.available", { count: totalCount })}
      </p>
      <div
        className={cn(
          "grid gap-4 xl:grid-cols-2",
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
      </div>
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
  const { t } = useTranslation();
  return (
    <Card className="flex h-full flex-col p-5 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-foreground">{request.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {request.projectName}
          </p>
        </div>
        {request.difficulty && (
          <span className="rounded-full bg-border/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {getContributionRequestDifficultyLabel(request.difficulty)}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {request.technologyTags.map((technology) => (
          <span
            key={technology}
            dir="ltr"
            className="rounded-full border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {technology}
          </span>
        ))}
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Metadata
          label={t("tasks.deadline")}
          value={formatContributionDateTime(request.applicationsCloseAt)}
        />
        <Metadata
          label={t("tasks.targetCompletion")}
          value={formatContributionDate(request.targetCompletionDate)}
        />
        <Metadata
          label={t("tasks.reward")}
          value={formatContributionReward(request.reward)}
        />
      </dl>
      <Button asChild size="sm" className="mt-auto w-full">
        <a href={requestHref(request.id)}>{t("tasks.viewRequest")}</a>
      </Button>
    </Card>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        dir="ltr"
        className="mt-1 text-end font-mono text-sm font-medium text-foreground"
      >
        {value}
      </dd>
    </div>
  );
}
