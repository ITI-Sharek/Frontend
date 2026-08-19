import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { requireContributorRoute } from "@/modules/auth";
import {
  ContributorDashboardView,
  useContributorDashboardQuery,
} from "@/modules/dashboard";
import { ContributorDeliveryLifecycleSection } from "@/modules/delivery-reviews";
import { MatchedProjectsLockedCard } from "@/modules/matching";

export const Route = createFileRoute("/_appLayout/dashboard")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const dashboardQuery = useContributorDashboardQuery();

  if (dashboardQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  return (
    <ContributorDashboardView
      dashboard={dashboardQuery.data}
      deliveryLifecycleSlot={<ContributorDeliveryLifecycleSection />}
      // Cross-module composition belongs in the route: dashboard renders the
      // matched list, matching owns what a free contributor is offered instead.
      matchedProjectsLockedSlot={<MatchedProjectsLockedCard />}
    />
  );
}
