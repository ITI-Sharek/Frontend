export type ProjectStatus = "draft" | "published" | "archived";

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
  createdAt: string;
  updatedAt: string;
}

export interface ImportGitHubProjectPayload {
  /** GitHub repository full name, e.g. "owner/repository". */
  fullName: string;
}
