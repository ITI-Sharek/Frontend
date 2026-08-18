import {
  Archive,
  CircleCheck,
  FileText,
  FolderGit2,
  FolderSearch,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { StatusChip } from "@/shared/components/data-display/status-chip";
import { Button } from "@/shared/components/ui/button";
import { SearchField } from "@/shared/components/ui/search-field";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import type {
  CursorPageInfoDto,
  MyProjectsFilters,
  MyProjectStatus,
  MyProjectSummaryDto,
  OwnerQuotaDto,
} from "../../types/my-projects.types";

const STATUS_META = {
  draft: { tone: "neutral" as const, icon: FileText, labelKey: "draft" },
  published: { tone: "positive" as const, icon: CircleCheck, labelKey: "published" },
  archived: { tone: "neutral" as const, icon: Archive, labelKey: "archived" },
};

/**
 * OJ-1 owner portfolio (screen-inventory §4.2): rows with status + pipeline
 * counts; filtering by status and search keyword; empty state is the first-import hero.
 * Backed by cursor-paginated `GET /projects/me`.
 */
export function MyProjectsList({
  projects,
  quota,
  pageInfo,
  importHref,
  onProjectHref,
  onLoadMore,
  isLoadingMore = false,
  filters,
  onFiltersChange,
  onResetFilters,
}: {
  projects: MyProjectSummaryDto[];
  quota: OwnerQuotaDto;
  pageInfo: CursorPageInfoDto;
  importHref: string;
  onProjectHref: (projectId: string) => string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  filters?: MyProjectsFilters;
  onFiltersChange?: (partial: Partial<MyProjectsFilters>) => void;
  onResetFilters?: () => void;
}) {
  const { t } = useTranslation();
  const [searchDraft, setSearchDraft] = useState(filters?.q ?? "");

  useEffect(() => {
    setSearchDraft(filters?.q ?? "");
  }, [filters?.q]);

  const activeStatus = filters?.status ?? "all";
  const isFiltered = Boolean(
    (filters?.q && filters.q.trim() !== "") ||
      (filters?.status && filters.status !== "all"),
  );

  const handleSearchSubmit = () => {
    const trimmed = searchDraft.trim();
    onFiltersChange?.({ q: trimmed !== "" ? trimmed : undefined });
  };

  const handleSearchClear = () => {
    setSearchDraft("");
    onFiltersChange?.({ q: undefined });
  };

  const handleStatusChange = (val: string) => {
    onFiltersChange?.({
      status: val === "all" ? undefined : (val as MyProjectStatus),
    });
  };

  const handleResetAll = () => {
    setSearchDraft("");
    onResetFilters?.();
  };

  const showFilters = isFiltered || projects.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("myProjects.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("myProjects.monthlyQuota", { used: quota.used, total: quota.monthlyLimit })}
          </p>
        </div>
        <Button asChild size="sm">
          <a href={importHref}>
            <Plus className="size-4" />
            {t("myProjects.importProject")}
          </a>
        </Button>
      </div>

      {showFilters && (
        <div className="mt-6 flex flex-col gap-3 rounded-card border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={activeStatus}
            onValueChange={handleStatusChange}
            className="w-full sm:w-auto"
          >
            <TabsList className="flex w-full flex-wrap sm:w-auto">
              <TabsTrigger value="all" className="flex-1 gap-1.5 sm:flex-none">
                <Layers className="size-4" />
                {t("myProjects.statusAll")}
              </TabsTrigger>
              <TabsTrigger value="published" className="flex-1 gap-1.5 sm:flex-none">
                <CircleCheck className="size-4" />
                {t("myProjects.status.published")}
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex-1 gap-1.5 sm:flex-none">
                <FileText className="size-4" />
                {t("myProjects.status.draft")}
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex-1 gap-1.5 sm:flex-none">
                <Archive className="size-4" />
                {t("myProjects.status.archived")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 sm:max-w-xs">
            <SearchField
              value={searchDraft}
              onChange={setSearchDraft}
              onSearch={handleSearchSubmit}
              onClear={handleSearchClear}
              searchLabel={t("myProjects.searchLabel")}
              clearSearchLabel={t("myProjects.clearSearch")}
              searchButtonLabel={t("myProjects.searchButton")}
              placeholder={t("myProjects.searchPlaceholder")}
            />
            {isFiltered && onResetFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title={t("myProjects.resetFilters")}
              >
                <RotateCcw className="size-4" />
                <span className="sr-only sm:not-sr-only sm:inline sm:text-xs">
                  {t("myProjects.resetFilters")}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        isFiltered ? (
          <div className="mt-6 rounded-card border border-dashed border-border bg-card p-12 text-center">
            <FolderSearch className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-bold text-foreground">
              {t("myProjects.noMatchingTitle")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              {t("myProjects.noMatchingDescription")}
            </p>
            {onResetFilters && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={handleResetAll}
              >
                <RotateCcw className="size-4" />
                {t("myProjects.resetFilters")}
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-dashed border-border bg-card p-12 text-center">
            <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-3 text-lg font-bold text-foreground">
              {t("myProjects.emptyTitle")}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
              {t("myProjects.emptyDescription")}
            </p>
            <Button asChild size="sm" className="mt-4">
              <a href={importHref}>
                <Plus className="size-4" />
                {t("myProjects.importProject")}
              </a>
            </Button>
          </div>
        )
      ) : (
        <>
          <div className="mt-5 divide-y divide-border rounded-card border border-border bg-card">
            {projects.map((project) => {
              const meta = STATUS_META[project.status];
              return (
                <div
                  key={project.id}
                  className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-surface-fog/40"
                >
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="text-end font-mono text-[14px] font-bold tracking-[0.65px] text-foreground">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("myProjects.projectSummary", {
                        open: project.openRequestsCount,
                        pending: project.pendingApplicationsCount,
                        activity: project.lastActivityLabel,
                      })}
                    </p>
                  </div>
                  <StatusChip tone={meta.tone} icon={meta.icon}>
                    {t(`myProjects.status.${meta.labelKey}`)}
                  </StatusChip>
                  <Button asChild size="sm" variant="outline">
                    <a href={onProjectHref(project.id)}>{t("myProjects.manage")}</a>
                  </Button>
                </div>
              );
            })}
          </div>

          {pageInfo.hasNextPage && onLoadMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                {t("myProjects.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
