import type { ExploreSearchParamsDto } from "../types/explore.types";

export const projectsQueryKeys = {
  all: ["projects"] as const,
  explore: (params: ExploreSearchParamsDto) =>
    [...projectsQueryKeys.all, "explore", params] as const,
  adminPublishedOwners: () =>
    [...projectsQueryKeys.all, "admin", "published-owners"] as const,
};
