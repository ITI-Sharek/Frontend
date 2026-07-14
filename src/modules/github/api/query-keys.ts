export const githubKeys = {
  all: ["github"] as const,
  account: () => [...githubKeys.all, "account"] as const,
  repositories: (page = 1, perPage = 12) =>
    [...githubKeys.all, "repositories", page, perPage] as const,
  repositoryStatistics: (fullName: string) =>
    [...githubKeys.all, "repositories", fullName, "statistics"] as const,
  repositoryContributionActivity: (fullName: string) =>
    [
      ...githubKeys.all,
      "repositories",
      fullName,
      "contribution-activity",
    ] as const,
  repositoryCommitSignals: (fullName: string, author?: string) =>
    [
      ...githubKeys.all,
      "repositories",
      fullName,
      "commit-signals",
      author ?? "all-authors",
    ] as const,
};
