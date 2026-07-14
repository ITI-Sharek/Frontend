import { describe, expect, it, vi } from "vitest";

import {
  getGitHubAccount,
  getGitHubRepositoryCommitSignals,
  getGitHubRepositoryContributionActivity,
  getGitHubRepositoryStatistics,
  listGitHubRepositories,
} from "../../services/github.service";
import { githubAccountQueryOptions } from "./use-github-account-query";
import { githubRepositoriesQueryOptions } from "./use-github-repositories-query";
import { githubRepositoryCommitSignalsQueryOptions } from "./use-github-repository-commit-signals-query";
import { githubRepositoryContributionActivityQueryOptions } from "./use-github-repository-contribution-activity-query";
import { githubRepositoryStatisticsQueryOptions } from "./use-github-repository-statistics-query";

vi.mock("../../services/github.service", () => ({
  getGitHubAccount: vi.fn(),
  getGitHubRepositoryCommitSignals: vi.fn(),
  getGitHubRepositoryContributionActivity: vi.fn(),
  getGitHubRepositoryStatistics: vi.fn(),
  listGitHubRepositories: vi.fn(),
}));

async function runQueryFn<T>(queryFn: unknown): Promise<T> {
  return (queryFn as () => Promise<T>)();
}

describe("github query options", () => {
  it("builds the GitHub account query", async () => {
    vi.mocked(getGitHubAccount).mockResolvedValueOnce({
      id: "account-1",
      githubId: "123",
      username: "sara-dev",
      avatarUrl: null,
      profileUrl: "https://github.com/sara-dev",
      ingestionStatus: "completed",
      connectedAt: "2026-07-01T12:00:00.000Z",
      lastSyncedAt: null,
    });

    const options = githubAccountQueryOptions();

    expect(options.queryKey).toEqual(["github", "account"]);
    await expect(runQueryFn(options.queryFn)).resolves.toMatchObject({
      username: "sara-dev",
    });
    expect(getGitHubAccount).toHaveBeenCalledTimes(1);
  });

  it("disables repository loading until a connected account is available", () => {
    const options = githubRepositoriesQueryOptions({ enabled: false });

    expect(options.queryKey).toEqual(["github", "repositories", 1, 12]);
    expect(options.enabled).toBe(false);
    expect(listGitHubRepositories).not.toHaveBeenCalled();
  });

  it("loads repositories when enabled", async () => {
    vi.mocked(listGitHubRepositories).mockResolvedValueOnce({
      items: [],
      page: 2,
      perPage: 12,
      hasNextPage: false,
    });

    const options = githubRepositoriesQueryOptions({
      enabled: true,
      page: 2,
      perPage: 12,
    });

    expect(options.enabled).toBe(true);
    expect(options.queryKey).toEqual(["github", "repositories", 2, 12]);
    await expect(runQueryFn(options.queryFn)).resolves.toMatchObject({
      page: 2,
      items: [],
    });
    expect(listGitHubRepositories).toHaveBeenCalledWith({
      page: 2,
      perPage: 12,
    });
  });

  it("disables repository statistics when fullName is blank", () => {
    const options = githubRepositoryStatisticsQueryOptions({
      fullName: "   ",
    });

    expect(options.queryKey).toEqual([
      "github",
      "repositories",
      "",
      "statistics",
    ]);
    expect(options.enabled).toBe(false);
  });

  it("builds repository statistics queries by fullName", async () => {
    vi.mocked(getGitHubRepositoryStatistics).mockResolvedValueOnce({
      stars: 10,
      forks: 2,
      openIssues: 1,
      watchers: 3,
      fork: false,
      archived: false,
      defaultBranch: "main",
      pushedAt: null,
      updatedAt: null,
      contributionActivity: {
        totalContributors: 0,
        totalCommits: 0,
        lastYearCommitCount: 0,
        weeklyCommitCounts: [],
        topContributors: [],
        unavailableReason: "github_stats_pending",
      },
      commitSignals: {
        recentCommitCount: 0,
        latestCommitAt: null,
        oldestCommitAt: null,
        authors: [],
        recentCommits: [],
        unavailableReason: "github_stats_pending",
      },
    });

    const options = githubRepositoryStatisticsQueryOptions({
      fullName: " sharek/frontend ",
    });

    expect(options.queryKey).toEqual([
      "github",
      "repositories",
      "sharek/frontend",
      "statistics",
    ]);
    expect(options.enabled).toBe(true);
    await runQueryFn(options.queryFn);
    expect(getGitHubRepositoryStatistics).toHaveBeenCalledWith(
      "sharek/frontend",
    );
  });

  it("builds contribution activity queries by fullName", async () => {
    vi.mocked(getGitHubRepositoryContributionActivity).mockResolvedValueOnce({
      totalContributors: 0,
      totalCommits: 0,
      lastYearCommitCount: 0,
      weeklyCommitCounts: [],
      topContributors: [],
      unavailableReason: null,
    });

    const options = githubRepositoryContributionActivityQueryOptions({
      fullName: "sharek/frontend",
    });

    expect(options.queryKey).toEqual([
      "github",
      "repositories",
      "sharek/frontend",
      "contribution-activity",
    ]);
    await runQueryFn(options.queryFn);
    expect(getGitHubRepositoryContributionActivity).toHaveBeenCalledWith(
      "sharek/frontend",
    );
  });

  it("builds commit signal queries with optional author", async () => {
    vi.mocked(getGitHubRepositoryCommitSignals).mockResolvedValueOnce({
      recentCommitCount: 0,
      latestCommitAt: null,
      oldestCommitAt: null,
      authors: [],
      recentCommits: [],
      unavailableReason: null,
    });

    const options = githubRepositoryCommitSignalsQueryOptions({
      fullName: "sharek/frontend",
      author: " sara-dev ",
    });

    expect(options.queryKey).toEqual([
      "github",
      "repositories",
      "sharek/frontend",
      "commit-signals",
      "sara-dev",
    ]);
    await runQueryFn(options.queryFn);
    expect(getGitHubRepositoryCommitSignals).toHaveBeenCalledWith({
      fullName: "sharek/frontend",
      author: "sara-dev",
    });
  });
});
