import type { DashboardLifecycleState } from "../types/dashboard.types";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  contributor: (state: DashboardLifecycleState) =>
    [...dashboardQueryKeys.all, "contributor", state] as const,
};
