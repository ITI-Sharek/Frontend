import { createFileRoute } from "@tanstack/react-router";

import { requireContributorRoute } from "@/modules/auth";
import {
  ContributorDashboardView,
  useContributorDashboardQuery,
} from "@/modules/dashboard";
import type { DashboardLifecycleState } from "@/modules/dashboard";
import { RecommendedTasksSection } from "@/modules/matching";

interface DashboardSearch {
  /** Dev/demo affordance while the API is mocked: preview WF-02 states B/C. */
  state?: "onboarding" | "empty";
}

const SEARCH_STATE_MAP: Record<
  NonNullable<DashboardSearch["state"]>,
  DashboardLifecycleState
> = {
  onboarding: "onboarding",
  empty: "verified-empty",
};

export const Route = createFileRoute("/_appLayout/dashboard")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "لوحة التحكم | Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const state = search.state;
    return state === "onboarding" || state === "empty" ? { state } : {};
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { state } = Route.useSearch();
  const lifecycleState = state ? SEARCH_STATE_MAP[state] : "active";
  const dashboardQuery = useContributorDashboardQuery(lifecycleState);

  if (dashboardQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <ContributorDashboardView
      dashboard={dashboardQuery.data}
      recommendedSlot={<RecommendedTasksSection />}
    />
  );
}
