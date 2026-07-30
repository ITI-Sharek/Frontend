import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ApplicationStatusView } from "@/modules/contribution-requests";

export const Route = createFileRoute(
  "/_appLayout/applications/$applicationId",
)({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "حالة طلب التقديم | Sharek" }] }),
  component: ApplicationStatusPage,
});

function ApplicationStatusPage() {
  const { applicationId } = Route.useParams();
  return (
    <ApplicationStatusView
      applicationId={applicationId}
      requestHref={(requestId) =>
        `${ROUTES.tasks}/${encodeURIComponent(requestId)}`
      }
      requestsHref={ROUTES.tasks}
    />
  );
}
