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
  statistics: {
    stars: number;
    forks: number;
    contributors: number | null;
    latestCommitAt: string | null;
    sourceUpdatedAt: string | null;
    defaultBranch: string | null;
    recentCommits: Array<{
      sha: string;
      url: string | null;
      message: string;
      author: string | null;
      authoredAt: string | null;
    }>;
    rootEntries: Array<{
      name: string;
      path: string;
      type: "file" | "directory" | "symlink" | "submodule" | "unknown";
      size: number | null;
      url: string | null;
    }>;
    rootEntriesUnavailableReason: string | null;
    treeEntries: Array<{
      path: string;
      type: "file" | "directory" | "submodule" | "unknown";
      size: number | null;
      url: string;
    }>;
    treeTruncated: boolean;
    treeUnavailableReason: string | null;
  };
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
  owner: PublicProjectOwnerDto | null;
  source: PublicProjectSourceDto;
}

export interface PublicProjectOwnerDto {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  publishedProjectsCount: number;
}

export type PublicProjectDetailDto = PublicProjectListItemDto;

export interface PublicProjectApplicantDto {
  applicationId: string;
  contributionRequest: { id: string; title: string };
  contributor: {
    username: string | null;
    displayName: string;
    avatarUrl: string | null;
  };
  submittedAt: string;
}

export interface PublicProjectApplicantsResponseDto {
  items: PublicProjectApplicantDto[];
}

export interface PublicProjectSavedStateDto {
  saved: boolean;
}

export interface PublicProjectsListParams {
  cursor?: string;
  limit?: number;
}

export interface PublicProjectsListResponseDto {
  items: PublicProjectListItemDto[];
  pageInfo: CursorPageInfoDto;
}
