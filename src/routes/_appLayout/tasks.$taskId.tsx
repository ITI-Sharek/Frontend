import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ContributorContributionRequestDetailView } from "@/modules/contribution-requests";
import {
  MaterialsPanel,
  useContributionRequestMaterialsQuery,
} from "@/modules/materials";
import { SkillGapGuidancePanel } from "@/modules/skill-guidance";

export const Route = createFileRoute("/_appLayout/tasks/$taskId")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "طلب مساهمة | Sharek" }] }),
  component: ContributionRequestDetailsPage,
});

function ContributionRequestDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = Route.useNavigate();
  const materialsQuery = useContributionRequestMaterialsQuery(taskId);

  return (
    <ContributorContributionRequestDetailView
      requestId={taskId}
      requestsHref={ROUTES.tasks}
      dashboardHref={ROUTES.dashboard}
      applicationHref={ROUTES.application}
      projectHref={(slug) =>
        `${ROUTES.publicProjects}/${encodeURIComponent(slug)}`
      }
      guidanceSlot={<SkillGapGuidancePanel contributionRequestId={taskId} />}
      onApplicationSubmitted={(application) =>
        void navigate({
          href: ROUTES.application(application.id),
        })
      }
      materialsSlot={
        <MaterialsPanel
          scope={{ kind: "contribution-request", id: taskId }}
          isOwner={false}
          materials={materialsQuery.data}
          isLoading={materialsQuery.isPending}
          isError={materialsQuery.isError}
        />
      }
    />
  );
}
