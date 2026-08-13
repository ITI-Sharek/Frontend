import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getContributorDashboard } from "../../services/dashboard.service";
import { dashboardQueryKeys } from "../query-keys";
import type { DashboardLifecycleState } from "../../types/dashboard.types";

export function useContributorDashboardQuery(
  state: DashboardLifecycleState = "active",
) {
  const { t, i18n } = useTranslation();
  return useQuery({
    queryKey: dashboardQueryKeys.contributor(state, i18n.language),
    queryFn: () => getContributorDashboard(state, t),
  });
}
