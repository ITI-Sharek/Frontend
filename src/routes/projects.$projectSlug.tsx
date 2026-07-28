import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import {
  PublicProjectDetailView,
  getProjectApiErrorMessage,
  usePublicProjectBySlugQuery,
} from "@/modules/projects";

import { PublicProjectsShell } from "./-public-projects-shell";

export const Route = createFileRoute("/projects/$projectSlug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.projectSlug} | Sharek` }],
  }),
  component: PublicProjectDetailsPage,
});

function PublicProjectDetailsPage() {
  const { projectSlug } = Route.useParams();
  const projectQuery = usePublicProjectBySlugQuery(projectSlug);

  if (projectQuery.isPending) {
    return (
      <PublicProjectsShell>
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          جارٍ تحميل المشروع...
        </div>
      </PublicProjectsShell>
    );
  }

  if (projectQuery.isError) {
    return (
      <PublicProjectsShell>
        <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-bold text-foreground">لم نعثر على هذا المشروع</h1>
          <p className="text-sm text-muted-foreground">
            {getProjectApiErrorMessage(projectQuery.error)}
          </p>
          <a href={ROUTES.publicProjects} className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            العودة إلى المشاريع
          </a>
        </div>
      </PublicProjectsShell>
    );
  }

  return (
    <PublicProjectsShell>
      <PublicProjectDetailView
        project={projectQuery.data}
        exploreHref={ROUTES.publicProjects}
      />
    </PublicProjectsShell>
  );
}
