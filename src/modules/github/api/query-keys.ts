export const githubKeys = {
  all: ["github"] as const,
  account: () => [...githubKeys.all, "account"] as const,
  repositories: () => [...githubKeys.all, "repositories"] as const,
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
