import { createFileRoute } from "@tanstack/react-router";

import {
  ContributionRequestDetailView

} from "@/modules/contribution-requests";
import type {RequestWorkspaceTab} from "@/modules/contribution-requests";
import { requireOwnerRoute } from "@/modules/auth";
import {
  MaterialsPanel,
  useContributionRequestMaterialsQuery,
} from "@/modules/materials";
import { ROUTES } from "@/config/routes.config";
import { OwnerDeliveryReviewPanel } from "@/modules/delivery-reviews";

interface ContributionRequestSearch {
  section?: RequestWorkspaceTab;
}

export const Route = createFileRoute(
  "/_appLayout/contribution-requests/$requestId",
)({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): ContributionRequestSearch => {
    const raw = search.section ?? search.tab;
    const isValid =
      raw === "details" ||
      raw === "applications" ||
      raw === "matches" ||
      raw === "delivery" ||
      raw === "materials";
    return isValid ? { section: raw } : {};
  },
  component: ContributionRequestPage,
});

function ContributionRequestPage() {
  const { requestId } = Route.useParams();
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const materialsQuery = useContributionRequestMaterialsQuery(requestId);

  return (
    <ContributionRequestDetailView
      requestId={requestId}
      projectHref={ROUTES.ownerProject}
      activeSection={section}
      onSectionChange={(nextSection) => {
        void navigate({
          search: { section: nextSection },
          replace: true,
        });
      }}
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
