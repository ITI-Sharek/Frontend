import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { requireMemberRoute } from "@/modules/auth";
import { OwnerDeliveryInbox } from "@/modules/delivery-reviews";
import { MyProjectsList, useMyProjectsQuery } from "@/modules/projects";
import type {
  MyProjectsFilters,
  MyProjectStatus,
  MyProjectSummaryDto,
} from "@/modules/projects";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

const VALID_STATUSES: MyProjectStatus[] = ["draft", "published", "archived"];

export function validateMyProjectsSearch(
  search: Record<string, unknown>,
): MyProjectsFilters {
  const filters: MyProjectsFilters = {};
  if (typeof search.q === "string" && search.q.trim() !== "") {
    filters.q = search.q.trim();
  }
  if (
    typeof search.status === "string" &&
    VALID_STATUSES.includes(search.status as MyProjectStatus)
  ) {
    filters.status = search.status as MyProjectStatus;
  }
  return filters;
}

export const Route = createFileRoute("/_appLayout/my-projects/")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: validateMyProjectsSearch,
  component: MyProjectsPage,
});

function MyProjectsPage() {
  const { t } = useTranslation();
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadedProjects, setLoadedProjects] = useState<MyProjectSummaryDto[]>(
    [],
  );

  // Reset pagination state whenever filter parameters change
  const filterKey = `${filters.status ?? "all"}:${filters.q ?? ""}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCursor(undefined);
    setLoadedProjects([]);
  }

  const activeStatus =
    filters.status && filters.status !== "all" ? filters.status : undefined;
  const activeQ =
    filters.q && filters.q.trim() !== "" ? filters.q.trim() : undefined;

  const projectsQuery = useMyProjectsQuery({
    cursor,
    status: activeStatus,
    q: activeQ,
  });

  const handleFiltersChange = (partial: Partial<MyProjectsFilters>) => {
    setCursor(undefined);
    setLoadedProjects([]);
    const nextFilters: MyProjectsFilters = { ...filters, ...partial };
    if (nextFilters.status === "all" || !nextFilters.status) {
      delete nextFilters.status;
    }
    if (!nextFilters.q || nextFilters.q.trim() === "") {
      delete nextFilters.q;
    }
    void navigate({
      search: nextFilters,
      replace: true,
    });
  };

  const handleResetFilters = () => {
    setCursor(undefined);
    setLoadedProjects([]);
    void navigate({
      search: {},
      replace: true,
    });
  };

  if (projectsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm leading-6 text-destructive">
          {getApiErrorMessage(
            projectsQuery.error,
            t("myProjects.loadError"),
          )}
        </p>
      </div>
    );
  }

  if (projectsQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("myProjects.loading")}</p>
      </div>
    );
  }

  const seenIds = new Set(loadedProjects.map((project) => project.id));
  const projects = [
    ...loadedProjects,
    ...projectsQuery.data.projects.filter((project) => !seenIds.has(project.id)),
  ];

  return (
    <>
      <OwnerDeliveryInbox />
      <MyProjectsList
        projects={projects}
        quota={projectsQuery.data.quota}
        pageInfo={projectsQuery.data.pageInfo}
        importHref="/my-projects/new"
        onProjectHref={(projectId) => `/my-projects/${encodeURIComponent(projectId)}`}
        isLoadingMore={projectsQuery.isFetching && cursor !== undefined}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        onLoadMore={() => {
          const nextCursor = projectsQuery.data.pageInfo.nextCursor;
          if (!nextCursor) return;
          setLoadedProjects(projects);
          setCursor(nextCursor);
        }}
      />
    </>
  );
}
