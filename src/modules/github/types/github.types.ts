export type GitHubIngestionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed";

export interface GitHubAccountDto {
  id: string;
  githubId: string;
  username: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  ingestionStatus: GitHubIngestionStatus;
  connectedAt: string;
  lastSyncedAt: string | null;
}

export interface GitHubOAuthStartDto {
  authorizationUrl: string;
  state: string;
  expiresAt: string;
}

export interface GitHubOAuthCallbackPayload {
  code: string;
  state: string;
}

export interface GitHubRepositoryDto {
  githubRepoId: string;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
  defaultBranch: string;
  primaryLanguage: string | null;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  topics: string[];
  pushedAt: string | null;
  updatedAt: string | null;
}
