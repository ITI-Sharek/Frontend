import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { requireOwnerRoute } from "@/modules/auth";
import { getMyProjects, MyProjectsList } from "@/modules/projects";

export const Route = createFileRoute("/_appLayout/my-projects/")({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "مشاريعي | Sharek" }] }),
  component: MyProjectsPage,
});

function MyProjectsPage() {
  const projectsQuery = useQuery({
    queryKey: ["projects", "mine"],
    queryFn: getMyProjects,
  });

  if (projectsQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل مشاريعك...</p>
      </div>
    );
  }

  return (
    <MyProjectsList
      projects={projectsQuery.data.projects}
      quota={projectsQuery.data.quota}
      importHref="/my-projects/new"
    />
  );
}
