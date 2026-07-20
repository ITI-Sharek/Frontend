import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes.config";
import { getProjectBySlug, ProjectDetailsView } from "@/modules/projects";

export const Route = createFileRoute("/_appLayout/projects/$projectSlug")({
  beforeLoad: requireContributorRoute,
  head: ({ params }) => ({
    meta: [{ title: `${params.projectSlug} | Sharek` }],
  }),
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { projectSlug } = Route.useParams();
  const projectQuery = useQuery({
    queryKey: ["projects", "details", projectSlug],
    queryFn: () => getProjectBySlug(projectSlug),
    retry: false,
  });

  if (projectQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل المشروع...</p>
      </div>
    );
  }

  if (projectQuery.data === undefined) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">
          لم نعثر على هذا المشروع
        </h1>
        <p className="text-sm text-muted-foreground">
          ربما أُزيل أو تغيّر رابطه.
        </p>
        <a
          href={ROUTES.explore}
          className="rounded-input bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          العودة إلى الاستكشاف
        </a>
      </div>
    );
  }

  return (
    <ProjectDetailsView
      project={projectQuery.data}
      exploreHref={ROUTES.explore}
      getTaskHref={(taskId) => `/tasks/${taskId}`}
    />
  );
}
