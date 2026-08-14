import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ContributorContributionRequestDetailView } from "@/modules/contribution-requests";
import {
  MaterialsPanel,
  useContributionRequestMaterialsQuery,
} from "@/modules/materials";
import { SkillGapGuidancePanel } from "@/modules/skill-guidance";
import {
  DailyApplicationQuotaNotice,
  subscriptionQueryKeys,
} from "@/modules/subscriptions";

export const Route = createFileRoute("/_appLayout/tasks/$taskId")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ContributionRequestDetailsPage,
});

function ContributionRequestDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = Route.useNavigate();
  const materialsQuery = useContributionRequestMaterialsQuery(taskId);
  const queryClient = useQueryClient();

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
      applicationQuotaSlot={<DailyApplicationQuotaNotice />}
      onApplicationQuotaChanged={() =>
        void queryClient.invalidateQueries({
          queryKey: subscriptionQueryKeys.status,
        })
      }
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
