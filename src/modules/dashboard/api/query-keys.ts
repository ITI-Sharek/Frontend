import type { DashboardLifecycleState } from "../types/dashboard.types";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  contributor: (state: DashboardLifecycleState, language: string) =>
    [...dashboardQueryKeys.all, "contributor", state, language] as const,
};
