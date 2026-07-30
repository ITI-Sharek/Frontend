import { CircleAlert, Loader2, Search, X } from "lucide-react";
import { useState } from "react";

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
  CONTRIBUTION_REQUEST_DIFFICULTY_LABELS,
  formatContributionDate,
  formatContributionDateTime,
  formatContributionReward,
} from "../utils/contributor-presentation";
import type {
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
  const query = useContributionRequestsQuery(filters);
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");

  function reset() {
    setSearchDraft("");
    onReset();
  }

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        title="طلبات المساهمة المتاحة"
        description="استكشف العمل المنشور الذي ما زال يستقبل طلبات تقديم، ثم راجع عقد العمل قبل التواصل مع صاحب المشروع."
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
        <span className="sr-only">ابحث في طلبات المساهمة</span>
        <input
          value={value}
          placeholder="ابحث بالعنوان أو الوصف أو المشروع"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-input-placeholder"
          onChange={(event) => onChange(event.target.value)}
        />
        {value !== "" && (
          <button
            type="button"
            aria-label="مسح البحث"
            className="inline-flex size-8 items-center justify-center rounded-input text-muted-foreground hover:bg-border/25 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClear}
          >
            <X className="size-4" />
          </button>
        )}
      </label>
      <Button type="submit">بحث</Button>
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
  technologyFacets: string[];
  onChange: FeedViewProps["onFiltersChange"];
  onReset: () => void;
}) {
  const selectedTechnologies = filters.technologies ?? [];
  return (
    <aside className="h-fit rounded-card border border-border bg-card p-4">
      <h2 className="font-bold text-foreground">تصفية النتائج</h2>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          مستوى الصعوبة
        </legend>
        <select
          aria-label="مستوى الصعوبة"
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
          <option value="">كل المستويات</option>
          {Object.entries(CONTRIBUTION_REQUEST_DIFFICULTY_LABELS).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>
      </fieldset>
      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="text-sm font-semibold text-foreground">
          التقنيات
        </legend>
        <div className="mt-2 flex max-h-52 flex-col gap-2 overflow-y-auto">
          {technologyFacets.map((technology) => (
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
            </label>
          ))}
          {technologyFacets.length === 0 && (
            <p className="text-xs text-muted-foreground">
              لا توجد تقنيات متاحة حاليًا.
            </p>
          )}
        </div>
      </fieldset>
      <label className="mt-4 flex min-h-8 items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.hasReward === true}
          onChange={(event) =>
            onChange({
              hasReward: event.target.checked ? true : undefined,
            })
          }
        />
        بمكافأة معلنة فقط
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full"
        onClick={onReset}
      >
        إعادة تعيين الفلاتر
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
  if (isPending) {
    return (
      <PageFeedback
        icon={Loader2}
        title="جارٍ تحميل طلبات المساهمة"
        description="نسترجع الطلبات المنشورة التي ما زالت تستقبل التقديم."
      />
    );
  }
  if (isError) {
    return (
      <PageFeedback
        icon={CircleAlert}
        title="تعذر تحميل طلبات المساهمة"
        description="تحقق من اتصالك ثم حاول مرة أخرى."
        action={
          <Button size="sm" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }
  if (items.length === 0) {
    return (
      <PageFeedback
        title="لا توجد طلبات مساهمة تطابق هذه الفلاتر"
        description="جرّب إزالة أحد الفلاتر أو توسيع عبارة البحث."
        action={
          <Button variant="outline" size="sm" onClick={onReset}>
            عرض كل الطلبات
          </Button>
        }
      />
    );
  }
  return (
    <section aria-live="polite">
      <p className="mb-3 text-sm text-muted-foreground">
        <strong className="text-foreground">{totalCount}</strong> طلب مساهمة
        متاح
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
            {CONTRIBUTION_REQUEST_DIFFICULTY_LABELS[request.difficulty]}
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
          label="وقت إغلاق التقديم"
          value={formatContributionDateTime(request.applicationsCloseAt)}
        />
        <Metadata
          label="تاريخ الإنجاز المستهدف"
          value={formatContributionDate(request.targetCompletionDate)}
        />
        <Metadata
          label="المكافأة"
          value={formatContributionReward(request.reward)}
        />
      </dl>
      <Button asChild size="sm" className="mt-auto w-full">
        <a href={requestHref(request.id)}>عرض طلب المساهمة</a>
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
