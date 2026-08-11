import { createFileRoute } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

import {
  ContributionRequestCreateView,
  OwnerContributionRequestsWorkspace,
  getContributionRequestErrorMessage,
} from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import { useOwnerProjectQuery } from "@/modules/projects";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { SidePanel } from "@/shared/components/ui/side-panel";
import {
  PageContainer,
  PageFeedback,
} from "@/shared/components/layout/page-layout";

export const Route = createFileRoute(
  "/_appLayout/my-projects/$projectId/contribution-requests/",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "طلبات المساهمة | Sharek" }] }),
  component: OwnerContributionRequestsPage,
});

function OwnerContributionRequestsPage() {
  const { projectId } = Route.useParams();
  const navigate = Route.useNavigate();
  const projectQuery = useOwnerProjectQuery(projectId);
  const [createOpen, setCreateOpen] = useState(false);

  if (projectQuery.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          title="جارٍ تحميل المشروع"
          description="نتأكد من ملكية المشروع."
        />
      </PageContainer>
    );
  }

  if (projectQuery.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر تحميل المشروع"
          description={getContributionRequestErrorMessage(projectQuery.error)}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => void projectQuery.refetch()}>
                إعادة المحاولة
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={ROUTES.myProjects}>العودة إلى مشاريعي</a>
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const project = projectQuery.data;

  const projectTitle = project.project.title || "بلا عنوان";

  return (
    <>
      <OwnerContributionRequestsWorkspace
        projectId={projectId}
        projectTitle={projectTitle}
        canCreate={project.status === "published"}
        requestHref={(requestId) => ROUTES.contributionRequest(requestId)}
        newRequestHref={ROUTES.newContributionRequest(projectId)}
        onCreateRequest={() => setCreateOpen(true)}
      />
      <SidePanel
        open={createOpen}
        title="طلب مساهمة جديد"
        description={`أنشئ مسودة داخل مشروع «${projectTitle}» من دون مغادرة قائمة الطلبات.`}
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
