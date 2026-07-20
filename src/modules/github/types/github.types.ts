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

/** Repository evidence authorization currently granted to the contributor. */
export type GitHubRepositoryEvidenceAuthorization =
  | { kind: "oauth_identity_only" }
  | { kind: "oauth_repository_access" }
  | {
      kind: "github_app_selected";
      installationId: string;
      repositoryFullNames: string[];
    };

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

export interface GitHubRepositoryPageDto {
  items: GitHubRepositoryDto[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
}

export type GitHubRepositoryUnavailableReason =
  | "github_stats_pending"
  | "github_no_content"
  | "github_not_found"
  | "github_repository_empty_or_unavailable"
  | `github_http_${string}`;

export interface GitHubRepositoryTopContributorDto {
  login: string;
  profileUrl: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface GitHubRepositoryContributionActivityDto {
  totalContributors: number;
  totalCommits: number;
  lastYearCommitCount: number;
  weeklyCommitCounts: number[];
  topContributors: GitHubRepositoryTopContributorDto[];
  unavailableReason: GitHubRepositoryUnavailableReason | null;
}

export interface GitHubRepositoryRecentCommitDto {
  sha: string;
  htmlUrl: string;
  messageHeadline: string;
  authorLogin: string | null;
  authoredAt: string | null;
}

export interface GitHubRepositoryCommitSignalsDto {
  recentCommitCount: number;
  latestCommitAt: string | null;
  oldestCommitAt: string | null;
  authors: string[];
  recentCommits: GitHubRepositoryRecentCommitDto[];
  unavailableReason: GitHubRepositoryUnavailableReason | null;
}

export interface GitHubRepositoryStatisticsDto {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  fork: boolean;
  archived: boolean;
  defaultBranch: string;
  pushedAt: string | null;
  updatedAt: string | null;
  contributionActivity: GitHubRepositoryContributionActivityDto;
  commitSignals: GitHubRepositoryCommitSignalsDto;
}
