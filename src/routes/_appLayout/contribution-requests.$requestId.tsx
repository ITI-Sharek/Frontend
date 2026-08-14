import { createFileRoute } from "@tanstack/react-router";

import { ContributionRequestDetailView } from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import {
  MaterialsPanel,
  useContributionRequestMaterialsQuery,
} from "@/modules/materials";
import { ROUTES } from "@/config/routes.config";
import { OwnerDeliveryReviewPanel } from "@/modules/delivery-reviews";

export const Route = createFileRoute(
  "/_appLayout/contribution-requests/$requestId",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ContributionRequestPage,
});

function ContributionRequestPage() {
  const { requestId } = Route.useParams();
  const materialsQuery = useContributionRequestMaterialsQuery(requestId);

  return (
    <ContributionRequestDetailView
      requestId={requestId}
      projectHref={ROUTES.ownerProject}
      deliverySlot={<OwnerDeliveryReviewPanel requestId={requestId} />}
      materialsSlot={
        <MaterialsPanel
          scope={{ kind: "contribution-request", id: requestId }}
          isOwner
          materials={materialsQuery.data}
          isLoading={materialsQuery.isPending}
          isError={materialsQuery.isError}
        />
      }
    />
  );
}
