import { createFileRoute } from "@tanstack/react-router";

import { ContributionRequestDetailView } from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import { ROUTES } from "@/config/routes.config";

export const Route = createFileRoute(
  "/_appLayout/contribution-requests/$requestId",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "تفاصيل طلب المساهمة | Sharek" }] }),
  component: ContributionRequestPage,
});

function ContributionRequestPage() {
  const { requestId } = Route.useParams();
  return (
    <ContributionRequestDetailView
      requestId={requestId}
      projectHref={ROUTES.ownerProject}
    />
  );
}
