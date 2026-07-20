import type { ProjectCategory, ProjectDifficulty } from "./explore.types";

/**
 * Owner portfolio contracts (OJ-1 · screen-inventory §4.2–4.3).
 * Backed by GET /projects/me, GET /github/repositories, and
 * POST /projects/import/github for draft/published saves.
 */

export type MyProjectStatus = "draft" | "published" | "archived";

export interface MyProjectDto {
  id: string;
  title: string;
  slug: string;
  status: MyProjectStatus;
  openRequestsCount: number;
  pendingApplicationsCount: number;
  lastActivityLabel: string;
}

export interface RepoPickDto {
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  isPrivate: boolean;
}

export interface ImportDraftDto {
  title: string;
  description: string;
  technologies: string[];
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  /** Field names auto-filled from GitHub — labeled «من GitHub» in the UI. */
  fetchedFields: string[];
}

export interface OwnerQuotaDto {
  used: number;
  monthlyLimit: number;
}

export type ImportFailureCause =
  | "not_found"
  | "private"
  | "rate_limited"
  | "duplicate";
