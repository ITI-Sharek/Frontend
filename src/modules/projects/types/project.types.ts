export type ProjectStatus = "draft" | "published" | "archived";
export type ProjectCategory =
  | "web"
  | "mobile"
  | "ai_ml"
  | "devops"
  | "tools_utilities";
export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export interface ImportedProjectDto {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  githubRepoUrl: string;
  githubRepoId: string | null;
  languages: unknown;
  tags: unknown;
  technologies: unknown;
  repoStatistics: unknown;
  status: ProjectStatus;
  readmeContent: string | null;
  category: ProjectCategory | null;
  difficulty: ProjectDifficulty | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportGitHubProjectPayload {
  /** GitHub repository full name, e.g. "owner/repository". */
  fullName?: string;
  /** Public GitHub repository URL, e.g. "https://github.com/owner/repository". */
  repoUrl?: string;
  status?: Extract<ProjectStatus, "draft" | "published">;
  title?: string;
  description?: string;
  category?: ProjectCategory | null;
  difficulty?: ProjectDifficulty | null;
  technologies?: string[];
}
