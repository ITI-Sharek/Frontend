import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import {
  ContributionRequestCreateView,
  getContributionRequestErrorMessage,
} from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import { useMyProjectsQuery } from "@/modules/projects";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { PageContainer, PageFeedback } from "@/shared/components/layout/page-layout";

export const Route = createFileRoute(
  "/_appLayout/my-projects/$projectId/contribution-requests/new",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "إنشاء طلب مساهمة | Sharek" }] }),
  component: NewContributionRequestPage,
});

function NewContributionRequestPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const projectsQuery = useMyProjectsQuery();

  if (projectsQuery.isPending) {
    return (
      <PageContainer>
        <PageFeedback title="جارٍ التحقق من المشروع" description="نتأكد من ملكية المشروع وحالة نشره." />
      </PageContainer>
    );
  }

  if (projectsQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر تحميل المشروع"
          description={getContributionRequestErrorMessage(projectsQuery.error)}
          action={<Button onClick={() => void projectsQuery.refetch()}>إعادة المحاولة</Button>}
        />
      </PageContainer>
    );
  }

  const project = projectsQuery.data.projects.find((item) => item.id === projectId);
  if (!project || project.status !== "published") {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title={project ? "المشروع غير منشور" : "لم نعثر على المشروع"}
          description={
            project
              ? "انشر المشروع أولًا؛ لا يمكن إنشاء طلب مساهمة من مشروع مسودة أو مؤرشف."
              : "المشروع غير موجود أو لا يخص هذا الحساب."
          }
          action={
            <Button asChild variant="outline">
              <a href={project ? ROUTES.ownerProject(project.id) : ROUTES.myProjects}>
                {project ? "العودة إلى المشروع" : "العودة إلى مشاريعي"}
              </a>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <ContributionRequestCreateView
      projectId={project.id}
      projectTitle={project.title}
      cancelHref={ROUTES.ownerProject(project.id)}
      onCreated={(request) => {
        void navigate({ to: ROUTES.contributionRequest(request.id) });
      }}
      onProjectUnavailable={() => {
        void navigate({ to: ROUTES.ownerProject(project.id) });
      }}
    />
  );
}
