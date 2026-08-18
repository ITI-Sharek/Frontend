export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  contributor: () => [...dashboardQueryKeys.all, "contributor"] as const,
};
