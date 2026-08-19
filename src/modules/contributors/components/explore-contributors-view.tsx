import { ChevronLeft, ChevronRight, RotateCcw, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { SearchField } from "@/shared/components/ui/search-field";

import { useContributorDirectoryQuery } from "../api/queries/use-contributor-directory-query";
import type {
  ContributorDirectoryEntryDto,
  ContributorDirectorySearchParamsDto,
} from "../types/contributor-profile.types";

interface ExploreContributorsViewProps {
  params: ContributorDirectorySearchParamsDto;
  onParamsChange: (partial: ContributorDirectorySearchParamsDto) => void;
  onReset: () => void;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ContributorCard({
  contributor,
  isArabic,
}: {
  contributor: ContributorDirectoryEntryDto;
  isArabic: boolean;
}) {
  const { t } = useTranslation();
  const skills = [
    ...contributor.fields.map((field) =>
      isArabic ? field.labelAr : field.labelEn,
    ),
    ...contributor.declaredSkills,
  ].filter((skill, index, all) => all.indexOf(skill) === index);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-record)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar
          src={contributor.avatarUrl}
          alt={contributor.displayName}
          fallback={initials(contributor.displayName)}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-black text-foreground group-hover:text-primary">
            {contributor.displayName}
          </h2>
          <p className="mt-0.5 truncate font-mono text-sm text-muted-foreground" dir="ltr">
            @{contributor.username}
          </p>
          {contributor.experienceLevel && (
            <span className="mt-2 inline-flex rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-bold text-primary">
              {isArabic
                ? contributor.experienceLevel.labelAr
                : contributor.experienceLevel.labelEn}
            </span>
          )}
        </div>
      </div>

      <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-muted-foreground">
        {contributor.bio || t("exploreContributors.noBio")}
      </p>

      {skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-border/80 bg-surface-fog px-2.5 py-1 font-mono text-xs font-semibold text-foreground/80"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="rounded-lg border border-border/80 bg-surface-fog px-2.5 py-1 font-mono text-xs font-bold text-muted-foreground">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button asChild variant="outline" size="lg" className="w-full justify-between rounded-xl font-bold">
          <Link to={ROUTES.contributorProfile(contributor.username)}>
            {t("exploreContributors.viewProfile")}
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function ExploreContributorsView({
  params,
  onParamsChange,
  onReset,
}: ExploreContributorsViewProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const [searchDraft, setSearchDraft] = useState(params.q ?? "");
  const query = useContributorDirectoryQuery(params);
  const result = query.data;
  const pagination = result?.pagination;

  return (
    <div className="mx-auto w-full max-w-[1360px] px-4 py-6 md:px-6 md:py-8">
      <header className="sk-hero rounded-3xl px-6 py-8 shadow-[var(--shadow-record)] md:px-12 md:py-12">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-evidence-teal">
          <Users className="size-4" aria-hidden />
          <span>{t("exploreContributors.registryLabel")}</span>
        </div>
        <h1 className="mt-3 max-w-3xl text-balance text-3xl font-black leading-[1.12] tracking-tight text-hero-ink sm:text-4xl md:text-5xl">
          {t("exploreContributors.title")}
        </h1>
        <p className="mt-3.5 max-w-2xl text-pretty text-base font-medium leading-relaxed text-hero-ink-soft sm:text-lg">
          {t("exploreContributors.description")}
        </p>
        <SearchField
          className="mt-8 max-w-3xl"
          value={searchDraft}
          onChange={setSearchDraft}
          searchLabel={t("exploreContributors.search")}
          clearSearchLabel={t("exploreContributors.clearSearch")}
          searchButtonLabel={t("exploreContributors.searchButton")}
          placeholder={t("exploreContributors.searchPlaceholder")}
          tone="hero"
          onSearch={() => onParamsChange({ q: searchDraft.trim() || undefined, page: undefined })}
          onClear={() => {
            setSearchDraft("");
            onParamsChange({ q: undefined, page: undefined });
          }}
        />
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted-foreground">
          {t("exploreContributors.totalResults", { count: pagination?.total ?? 0 })}
          {params.q && <span> {t("exploreContributors.searchResultsFor", { query: params.q })}</span>}
        </p>
        {params.q && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            {t("exploreContributors.resetFilters")}
          </Button>
        )}
      </div>

      <div className="mt-5">
        {query.isPending ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-record)]">
                <div className="flex items-center gap-4">
                  <div className="skeleton size-[52px] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-36 rounded" />
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-[var(--shadow-record)]">
            <h2 className="text-xl font-black text-foreground">{t("exploreContributors.loadError")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("exploreContributors.loadErrorDescription")}</p>
            <Button className="mt-6" onClick={() => void query.refetch()}>{t("common.retry")}</Button>
          </div>
        ) : result !== undefined && result.contributors.length > 0 ? (
          <>
            <div className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-3", query.isPlaceholderData && "opacity-60")}>
              {result.contributors.map((contributor) => (
                <ContributorCard key={contributor.username} contributor={contributor} isArabic={isArabic} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-6">
                <Button variant="outline" disabled={pagination.page <= 1} onClick={() => onParamsChange({ page: pagination.page - 1 })}>
                  <ChevronRight className="size-4" aria-hidden />
                  {t("exploreContributors.previousPage")}
                </Button>
                <span className="font-mono text-xs font-bold tracking-wider text-muted-foreground">
                  {t("exploreContributors.page", { current: pagination.page, total: pagination.totalPages })}
                </span>
                <Button variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => onParamsChange({ page: pagination.page + 1 })}>
                  {t("exploreContributors.nextPage")}
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-[var(--shadow-record)]">
            <Users className="mx-auto size-12 text-muted-foreground/50" aria-hidden />
            <h2 className="mt-4 text-xl font-black text-foreground">{t("exploreContributors.noMatch")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("exploreContributors.noMatchDescription")}</p>
            {params.q && <Button variant="outline" className="mt-6" onClick={onReset}>{t("exploreContributors.resetFilters")}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
