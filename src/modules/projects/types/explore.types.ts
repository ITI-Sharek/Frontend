/**
 * Project discovery contract (WF-03 · IA §A `/explore`). Backed by
 * `GET /projects/discover` (TASK-3-05, see `docs/api-contracts.md`).
 */

export type ProjectCategory =
  | "web"
  | "mobile"
  | "ai_ml"
  | "devops"
  | "tools_utilities";

export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export interface ProjectLanguageShareDto {
  name: string;
  percent: number;
}

export interface ProjectRepoStatisticsDto {
  stars?: number;
  forks?: number;
  openIssues?: number;
  watchers?: number;
  pushedAt?: string | null;
  updatedAt?: string | null;
}

/** Mirrors the metadata indexed into the RAG store — source attribution only. */
export interface ProjectDiscoveryMetadataDto {
  source: "project";
  sourceId: string;
  keywords: string[];
  semanticText: string;
}

export interface DiscoveredProjectDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  technologies: string[];
  tags: string[];
  /** Raw byte counts per language, as returned by GitHub — not percentages. */
  languages: Record<string, number>;
  githubRepoUrl: string;
  repoStatistics: ProjectRepoStatisticsDto | null;
  publishedAt: string | null;
  discoveryMetadata: ProjectDiscoveryMetadataDto;
}

export interface ExploreSearchParamsDto {
  q?: string;
  technologies?: string[];
  category?: ProjectCategory;
  difficulty?: ProjectDifficulty;
  page?: number;
}

export interface DiscoverProjectsPaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DiscoverProjectsAppliedFiltersDto {
  technologies: string[];
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  search: string | null;
}

export interface DiscoverProjectsResponseDto {
  projects: DiscoveredProjectDto[];
  pagination: DiscoverProjectsPaginationDto;
  appliedFilters: DiscoverProjectsAppliedFiltersDto;
}
