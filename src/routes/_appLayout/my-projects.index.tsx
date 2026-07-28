import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { requireMemberRoute } from "@/modules/auth";
import { MyProjectsList, useMyProjectsQuery } from "@/modules/projects";
import type { MyProjectSummaryDto } from "@/modules/projects";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

export const Route = createFileRoute("/_appLayout/my-projects/")({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "مشاريعي | Sharek" }] }),
  component: MyProjectsPage,
});

function MyProjectsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadedProjects, setLoadedProjects] = useState<MyProjectSummaryDto[]>(
    [],
  );

  const projectsQuery = useMyProjectsQuery({ cursor });

  if (projectsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm leading-6 text-destructive">
          {getApiErrorMessage(
            projectsQuery.error,
            "تعذر تحميل مشاريعك — حاول مرة أخرى.",
          )}
        </p>
      </div>
    );
  }

  if (projectsQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل مشاريعك...</p>
      </div>
    );
  }

  const seenIds = new Set(loadedProjects.map((project) => project.id));
  const projects = [
    ...loadedProjects,
    ...projectsQuery.data.projects.filter((project) => !seenIds.has(project.id)),
  ];

  return (
    <MyProjectsList
      projects={projects}
      quota={projectsQuery.data.quota}
      pageInfo={projectsQuery.data.pageInfo}
      importHref="/my-projects/new"
      onProjectHref={(projectId) => `/my-projects/${encodeURIComponent(projectId)}`}
      isLoadingMore={projectsQuery.isFetching && cursor !== undefined}
      onLoadMore={() => {
        const nextCursor = projectsQuery.data.pageInfo.nextCursor;
        if (!nextCursor) return;
        setLoadedProjects(projects);
        setCursor(nextCursor);
      }}
    />
  );
}
