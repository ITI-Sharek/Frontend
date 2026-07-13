/**
 * Project discovery contract (WF-03 · IA §A `/explore`). No backend endpoint
 * exists yet — `explore.service.ts` serves mock data with this exact shape;
 * this file is the handoff contract for `GET /projects/explore`.
 */

export type ProjectCategory =
  | "web"
  | "mobile"
  | "ai_ml"
  | "devops"
  | "tools_utilities";

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export type ExploreSortKey = "newest" | "best_fit" | "most_active" | "open_tasks";

/** DEC-010: coverage buckets, never percentages. */
export type FitBucket = "strong" | "partial" | "low" | "unknown";

export interface ProjectLanguageShareDto {
  name: string;
  percent: number;
}

export interface ExploreFitHintDto {
  bucket: FitBucket;
  matchedCount: number;
  requiredCount: number;
  /** One-line explanation — a hint is never an unexplained score. */
  reason: string;
}

export interface ExploreProjectDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  languages: ProjectLanguageShareDto[];
  technologies: string[];
  stars: number;
  commitsThisMonth: number;
  updatedAgoLabel: string;
  openTasksCount: number;
  ownerUsername: string;
  /** Null for unauthenticated viewers (DEC-010). */
  fitHint: ExploreFitHintDto | null;
}

export interface ExploreSearchParamsDto {
  q?: string;
  technologies?: string[];
  category?: ProjectCategory;
  difficulty?: ProjectDifficulty;
  sort?: ExploreSortKey;
}

export interface ExploreResultDto {
  projects: ExploreProjectDto[];
  totalCount: number;
  /** All technologies available as filters (backend-provided facet). */
  technologyFacets: string[];
}
