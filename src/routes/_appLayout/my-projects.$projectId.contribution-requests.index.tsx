import { createFileRoute } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ContributionRequestCreateView,
  OwnerContributionRequestsWorkspace,
  getContributionRequestErrorMessage,
} from "@/modules/contribution-requests";
import type { OwnerSectionStatus } from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import { useOwnerProjectQuery } from "@/modules/projects";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { SidePanel } from "@/shared/components/ui/side-panel";
import {
  PageContainer,
  PageFeedback,
} from "@/shared/components/layout/page-layout";

interface OwnerRequestsSearch {
  section?: OwnerSectionStatus;
}

export const Route = createFileRoute(
  "/_appLayout/my-projects/$projectId/contribution-requests/",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): OwnerRequestsSearch => {
    const raw = search.section ?? search.tab;
    const isValid =
      raw === "published" ||
      raw === "applicationsClosed" ||
      raw === "draft" ||
      raw === "assigned" ||
      raw === "completed" ||
      raw === "cancelled" ||
      raw === "discarded";
    return isValid ? { section: raw } : {};
  },
  component: OwnerContributionRequestsPage,
});

function OwnerContributionRequestsPage() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const projectQuery = useOwnerProjectQuery(projectId);
  const [createOpen, setCreateOpen] = useState(false);

  if (projectQuery.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          title={t("project.ownerRoute.loadingTitle")}
          description={t("project.ownerRoute.loadingDescription")}
        />
      </PageContainer>
    );
  }

  if (projectQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title={t("project.ownerRoute.loadErrorTitle")}
          description={getContributionRequestErrorMessage(projectQuery.error)}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => void projectQuery.refetch()}>
                {t("common.retry")}
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={ROUTES.myProjects}>{t("contributionRequests.detail.backToProjects")}</a>
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const project = projectQuery.data;

  const projectTitle = project.project.title || t("project.ownerRoute.untitled");

  return (
    <>
      <OwnerContributionRequestsWorkspace
        projectId={projectId}
        projectTitle={projectTitle}
        canCreate={project.status === "published"}
        requestHref={(requestId) => ROUTES.contributionRequest(requestId)}
        newRequestHref={ROUTES.newContributionRequest(projectId)}
        onCreateRequest={() => setCreateOpen(true)}
        activeSection={section}
        onSectionChange={(nextSection) => {
          void navigate({
            search: { section: nextSection },
            replace: true,
          });
        }}
      />
      <SidePanel
        open={createOpen}
        title={t("contributionRequests.ownerWorkspace.newRequest")}
        description={t("project.ownerRoute.createPanelDescription", { project: projectTitle })}
        onClose={() => setCreateOpen(false)}
      >
        <ContributionRequestCreateView
          projectId={projectId}
          projectTitle={projectTitle}
          cancelHref={ROUTES.ownerContributionRequests(projectId)}
          presentation="panel"
          onCancel={() => setCreateOpen(false)}
          onCreated={(request) => {
            setCreateOpen(false);
            void navigate({ to: ROUTES.contributionRequest(request.id) });
          }}
        />
      </SidePanel>
    </>
  );
}
