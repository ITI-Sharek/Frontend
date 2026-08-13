import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PublicProjectsListView, usePublicProjectsQuery } from "@/modules/projects";
import type { PublicProjectListItemDto } from "@/modules/projects";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import { PublicProjectsShell } from "./-public-projects-shell";

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: PublicProjectsPage,
});

function PublicProjectsPage() {
  const { t } = useTranslation();
  const [cursor, setCursor] = useState<string | undefined>();
  const [loadedProjects, setLoadedProjects] = useState<PublicProjectListItemDto[]>([]);
  const projectsQuery = usePublicProjectsQuery({ cursor });

  if (projectsQuery.isError) {
    return (
      <PublicProjectsShell>
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 text-center text-sm text-destructive">
          {getApiErrorMessage(projectsQuery.error, t("publicProjects.loadError"))}
        </div>
      </PublicProjectsShell>
    );
  }

  if (!projectsQuery.data) {
    return (
      <PublicProjectsShell>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          {t("publicProjects.loading")}
        </div>
      </PublicProjectsShell>
    );
  }

  const seen = new Set(loadedProjects.map((project) => project.id));
  const projects = [
    ...loadedProjects,
    ...projectsQuery.data.items.filter((project) => !seen.has(project.id)),
  ];

  return (
    <PublicProjectsShell>
      <PublicProjectsListView
        projects={projects}
        pageInfo={projectsQuery.data.pageInfo}
        isLoadingMore={projectsQuery.isFetching && cursor !== undefined}
        onLoadMore={() => {
          const nextCursor = projectsQuery.data.pageInfo.nextCursor;
          if (!nextCursor) return;
          setLoadedProjects(projects);
          setCursor(nextCursor);
        }}
      />
    </PublicProjectsShell>
  );
}
