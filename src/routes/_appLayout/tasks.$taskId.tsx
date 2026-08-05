import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ContributorContributionRequestDetailView } from "@/modules/contribution-requests";

export const Route = createFileRoute("/_appLayout/tasks/$taskId")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "طلب مساهمة | Sharek" }] }),
  component: ContributionRequestDetailsPage,
});

function ContributionRequestDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <ContributorContributionRequestDetailView
      requestId={taskId}
      requestsHref={ROUTES.tasks}
      dashboardHref={ROUTES.dashboard}
      applicationHref={ROUTES.application}
      projectHref={(slug) =>
        `${ROUTES.publicProjects}/${encodeURIComponent(slug)}`
      }
      onApplicationSubmitted={(application) =>
        void navigate({
          href: ROUTES.application(application.id),
        })
      }
    />
  );
}
