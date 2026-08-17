import { ChevronDown, CircleAlert, Loader2 } from "lucide-react";
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
      <SearchField
        className="mt-5"
        value={searchDraft}
        onChange={setSearchDraft}
        searchLabel={t("tasks.search")}
        clearSearchLabel={t("tasks.clearSearch")}
        searchButtonLabel={t("tasks.searchButton")}
        placeholder={t("tasks.searchPlaceholder")}
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
    (filters.hasReward === undefined ? 0 : 1);

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
      <details className="group rounded-card border border-border bg-card lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          <span>{t("tasks.filterResults")}</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className="ms-auto size-4 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-border p-4">{controls}</div>
      </details>
      <aside className="hidden h-fit rounded-card border border-border bg-card p-4 lg:block">
        <h2 className="font-bold text-foreground">{t("tasks.filterResults")}</h2>
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
  return (
    <>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          {t("tasks.difficulty")}
        </legend>
        <NativeSelect
          aria-label={t("tasks.difficulty")}
          value={filters.difficulty ?? ""}
          size="sm"
          className="mt-2 bg-background"
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
              <Checkbox
                checked={selectedTechnologies.includes(technology)}
                onCheckedChange={(checked) => {
                  const next = checked === true
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
          className="mt-2 bg-background"
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={onReset}
      >
        {t("tasks.resetFilters")}
      </Button>
    </>
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
        command="sharek ls requests --open"
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
      {/*
       * `tasks.available` emphasises the count with a <strong> tag, which
       * `t()` renders as literal text. <Trans> maps it to a real element.
       */}
      <p className="mb-4 text-sm text-muted-foreground">
        <Trans
          i18nKey="tasks.available"
          count={totalCount}
          components={{
            strong: <span className="tnum font-bold text-foreground" />,
          }}
        />
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
  const { t, i18n } = useTranslation();
  const reward = request.reward;
  const locale = i18n.language.startsWith("en") ? "en-US" : "ar-EG";

  return (
    <Card
      interactive
      padding="none"
      className="group flex h-full flex-col overflow-hidden"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="bidi text-pretty font-bold leading-snug text-foreground">
              {request.title}
            </h2>
            <p className="bidi mt-1 truncate text-sm text-muted-foreground">
              {request.projectName}
            </p>
          </div>
          {request.difficulty && (
            <span className="shrink-0 rounded-full border border-border-strong bg-surface-fog px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
              {getContributionRequestDifficultyLabel(request.difficulty)}
            </span>
          )}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {request.technologyTags.map((technology) => (
            <span
              key={technology}
              dir="ltr"
              className="rounded-social border border-border bg-surface-fog px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {technology}
            </span>
          ))}
        </div>

        {/*
         * The two dates are constraints on the same decision, so they share
         * one row and one hairline; the reward is the decision's payoff and
         * gets the whole opposite side to itself.
         */}
        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 pt-5 text-sm">
          <Metadata
            label={t("tasks.deadline")}
            value={formatContributionDateTime(request.applicationsCloseAt)}
          />
          <Metadata
            label={t("tasks.targetCompletion")}
            value={formatContributionDate(request.targetCompletionDate)}
          />
        </dl>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-fog px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle-foreground">
            {t("tasks.reward")}
          </p>
          <div className="mt-0.5" dir="ltr">
            {reward ? (
              <StatValue
                value={reward.amount.toLocaleString(locale)}
                unit={reward.currency}
                size="md"
              />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {formatContributionReward(reward)}
              </span>
            )}
          </div>
        </div>

        <Button asChild size="sm" className="shrink-0">
          <a href={requestHref(request.id)}>
            {t("tasks.viewRequest")}
            <DirectionalArrow className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] font-medium text-subtle-foreground">
        {label}
      </dt>
      <dd className="tnum mt-0.5 text-[13px] font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}
