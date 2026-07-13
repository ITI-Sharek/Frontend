import { useQuery } from "@tanstack/react-query";

import { getContributorDashboard } from "../../services/dashboard.service";
import { dashboardQueryKeys } from "../query-keys";
import type { DashboardLifecycleState } from "../../types/dashboard.types";

export function useContributorDashboardQuery(
  state: DashboardLifecycleState = "active",
) {
  return useQuery({
    queryKey: dashboardQueryKeys.contributor(state),
    queryFn: () => getContributorDashboard(state),
  });
}
