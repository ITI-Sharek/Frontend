import { useQuery } from "@tanstack/react-query";

import { getContributorDashboard } from "../../services/dashboard.service";

import { dashboardQueryKeys } from "../query-keys";

export function useContributorDashboardQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.contributor(),
    queryFn: getContributorDashboard,
  });
}
