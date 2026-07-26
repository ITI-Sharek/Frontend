import type { ProjectCategory, ProjectDifficulty } from "./explore.types";

/**
 * Project details contract (WF-04 · screen-inventory §1.3). Mock-first;
 * future endpoint `GET /projects/:projectSlug` (slug per DEC-025). Kept
 * self-contained (no dependency on the now-live `explore.types`/service)
 * since discovery and details are separate backend efforts.
 */

/** DEC-010: coverage buckets, never percentages. */
export type FitBucket = "strong" | "partial" | "low" | "unknown";

export interface ExploreFitHintDto {
  bucket: FitBucket;
  matchedCount: number;
  requiredCount: number;
  /** One-line explanation — a hint is never an unexplained score. */
  reason: string;
}

export interface MockProjectLanguageShareDto {
  name: string;
  percent: number;
}

export interface MockProjectDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  languages: MockProjectLanguageShareDto[];
  technologies: string[];
  stars: number;
  commitsThisMonth: number;
  updatedAgoLabel: string;
  openTasksCount: number;
  ownerUsername: string;
  /** Null for unauthenticated viewers (DEC-010). */
  fitHint: ExploreFitHintDto | null;
}

export interface ProjectTaskSummaryDto {
  id: string;
  title: string;
  requiredTechnologies: string[];
  difficulty: ProjectDifficulty;
  deadlineLabel: string | null;
  rewardLabel: string | null;
  fitHint: ExploreFitHintDto | null;
}

export interface ProjectDetailsDto extends MockProjectDto {
  readmeDigest: string;
  ownerDisplayName: string;
  archived: boolean;
  openTasks: ProjectTaskSummaryDto[];
}
