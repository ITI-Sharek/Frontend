import type { ExploreSearchParamsDto } from "../types/explore.types";
import type { MyProjectsListParams } from "../types/my-projects.types";
import type { PublicProjectsListParams } from "../types/public-project.types";

const PROJECTS_ROOT = ["projects"] as const;
const MINE_ROOT = [...PROJECTS_ROOT, "mine"] as const;
const PUBLIC_ROOT = [...PROJECTS_ROOT, "public"] as const;

export const projectsQueryKeys = {
  all: PROJECTS_ROOT,
  categories: () => [...PROJECTS_ROOT, "categories"] as const,
  difficulties: () => [...PROJECTS_ROOT, "difficulties"] as const,
  explore: (params: ExploreSearchParamsDto) =>
    [...PROJECTS_ROOT, "explore", params] as const,
  adminPublishedOwners: () =>
    [...PROJECTS_ROOT, "admin", "published-owners"] as const,
  mineRoot: MINE_ROOT,
  mine: (params: MyProjectsListParams = {}) =>
    [...MINE_ROOT, "list", params] as const,
  ownerDetail: (projectId: string) =>
    [...MINE_ROOT, "detail", projectId] as const,
  publicRoot: PUBLIC_ROOT,
  public: (params: PublicProjectsListParams = {}) =>
    [...PUBLIC_ROOT, "list", params] as const,
  publicBySlug: (projectSlug: string) =>
    [...PUBLIC_ROOT, "detail", projectSlug] as const,
  publicApplicants: (projectSlug: string) =>
    [...PUBLIC_ROOT, "applicants", projectSlug] as const,
  publicSavedState: (projectSlug: string) =>
    [...PUBLIC_ROOT, "saved-state", projectSlug] as const,
};
