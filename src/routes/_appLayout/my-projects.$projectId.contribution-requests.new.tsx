import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: NewContributionRequestPage,
});

function NewContributionRequestPage() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const projectsQuery = useMyProjectsQuery();

  if (projectsQuery.isPending) {
    return (
      <PageContainer>
        <PageFeedback title={t("project.ownerRoute.verifyingTitle")} description={t("project.ownerRoute.verifyingDescription")} />
      </PageContainer>
    );
  }

  if (projectsQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title={t("project.ownerRoute.loadErrorTitle")}
          description={getContributionRequestErrorMessage(projectsQuery.error)}
          action={<Button onClick={() => void projectsQuery.refetch()}>{t("common.retry")}</Button>}
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
          title={project ? t("project.ownerRoute.notPublishedTitle") : t("project.ownerRoute.notFoundTitle")}
          description={
            project
              ? t("project.ownerRoute.notPublishedDescription")
              : t("project.ownerRoute.notFoundDescription")
          }
          action={
            <Button asChild variant="outline">
              <a href={project ? ROUTES.ownerProject(project.id) : ROUTES.myProjects}>
                {project ? t("contributionRequests.detail.backToProject") : t("contributionRequests.detail.backToProjects")}
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
    />
  );
}
