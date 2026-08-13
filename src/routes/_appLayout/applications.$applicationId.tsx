import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { requireMemberRoute, useResolvedCurrentUser } from "@/modules/auth";
import {
  ApplicationStatusView,
  useApplicationQuery,
} from "@/modules/contribution-requests";
import { ContributorDeliveryPanel } from "@/modules/delivery-reviews";

export const Route = createFileRoute(
  "/_appLayout/applications/$applicationId",
)({
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ApplicationStatusPage,
});

/**
 * The contributor's own view of an Application, including the withdraw control.
 *
 * The route accepts both member roles so an older owner notification link can
 * resolve the Application and continue to the owner's Contribution Request
 * review screen. Contributor controls still wait for a confirmed contributor
 * rather than assuming one during SSR.
 */
function ApplicationStatusPage() {
  const { t } = useTranslation();
  const { applicationId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { currentUser: contextUser } = Route.useRouteContext();
  const { currentUser, isResolving } = useResolvedCurrentUser(contextUser);
  const applicationQuery = useApplicationQuery(applicationId);

  useEffect(() => {
    if (currentUser?.role !== "owner" || !applicationQuery.data) return;

    void navigate({
      to: ROUTES.contributionRequest(applicationQuery.data.contributionRequestId),
      replace: true,
    });
  }, [applicationQuery.data, currentUser?.role, navigate]);

  if (isResolving || !currentUser) {
    return (
      <p role="status" className="p-8 text-center text-sm text-muted-foreground">
        {t("applicationRoute.verifyingAccount")}
      </p>
    );
  }

  if (currentUser.role === "owner") {
    if (applicationQuery.isError) {
      return (
        <p role="alert" className="p-8 text-center text-sm text-destructive">
          {t("applicationRoute.ownerOpenError")}
        </p>
      );
    }

    return (
      <p role="status" className="p-8 text-center text-sm text-muted-foreground">
        {t("applicationRoute.openingRequest")}
      </p>
    );
  }

  // The guard is already redirecting; this only stops the wrong controls from
  // flashing on the way out.
  if (currentUser.role !== "contributor") {
    return (
      <p role="status" className="p-8 text-center text-sm text-muted-foreground">
        {t("applicationRoute.redirecting")}
      </p>
    );
  }

  return (
    <ApplicationStatusView
      applicationId={applicationId}
      requestHref={(requestId) =>
        `${ROUTES.tasks}/${encodeURIComponent(requestId)}`
      }
      requestsHref={ROUTES.tasks}
      deliverySlot={<ContributorDeliveryPanel applicationId={applicationId} />}
    />
  );
}
