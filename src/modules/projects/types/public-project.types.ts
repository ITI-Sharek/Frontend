import type {
  ProjectCategory,
  ProjectDifficulty,
} from "./project.types";
import type { CursorPageInfoDto } from "./my-projects.types";

/**
 * Minimal public published-project reads (SK-112 contract §9-10). Separate
 * from the existing `/projects/discover` semantic discovery feed — SK-112
 * adds no search, filtering, ranking, or recommendations.
 */

export interface PublicProjectPublicSourceDto {
  provider: "github";
  attributionStatus: "public";
  fullName: string;
  repositoryUrl: string;
  /** Nullable: a reconciled legacy source may not carry a fetch timestamp. */
  fetchedAt: string | null;
}

export interface PublicProjectWithheldSourceDto {
  provider: "github";
  attributionStatus: "withheld";
}

export type PublicProjectSourceDto =
  | PublicProjectPublicSourceDto
  | PublicProjectWithheldSourceDto;

export interface PublicProjectListItemDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: string[];
  technologies: string[];
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  publishedAt: string;
  source: PublicProjectSourceDto;
}

export type PublicProjectDetailDto = PublicProjectListItemDto;

export interface PublicProjectsListParams {
  cursor?: string;
  limit?: number;
}

export interface PublicProjectsListResponseDto {
  items: PublicProjectListItemDto[];
  pageInfo: CursorPageInfoDto;
}
