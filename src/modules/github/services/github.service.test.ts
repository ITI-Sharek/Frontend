import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  getGitHubRepositoryCommitSignals,
  getGitHubRepositoryContributionActivity,
  getGitHubRepositoryStatistics,
  listGitHubRepositories,
} from "./github.service";
import type {
  GitHubRepositoryCommitSignalsDto,
  GitHubRepositoryContributionActivityDto,
  GitHubRepositoryStatisticsDto,
} from "../types/github.types";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

const contributionActivity: GitHubRepositoryContributionActivityDto = {
  totalContributors: 2,
  totalCommits: 42,
  lastYearCommitCount: 24,
  weeklyCommitCounts: [1, 2, 3],
  topContributors: [
    {
      login: "sara-dev",
      profileUrl: "https://github.com/sara-dev",
      commits: 24,
      additions: 1200,
      deletions: 300,
    },
  ],
  unavailableReason: null,
};

const commitSignals: GitHubRepositoryCommitSignalsDto = {
  recentCommitCount: 2,
  latestCommitAt: "2026-07-12T12:00:00.000Z",
  oldestCommitAt: "2026-07-01T12:00:00.000Z",
  authors: ["sara-dev"],
  recentCommits: [
    {
      sha: "abc123",
      htmlUrl: "https://github.com/sharek/app/commit/abc123",
      messageHeadline: "Add profile view",
      authorLogin: "sara-dev",
      authoredAt: "2026-07-12T12:00:00.000Z",
    },
  ],
  unavailableReason: null,
};

const statistics: GitHubRepositoryStatisticsDto = {
  stars: 10,
  forks: 3,
  openIssues: 2,
  watchers: 5,
  fork: false,
  archived: false,
  defaultBranch: "main",
  pushedAt: "2026-07-12T12:00:00.000Z",
  updatedAt: "2026-07-12T13:00:00.000Z",
  contributionActivity,
  commitSignals,
};

describe("github service repository statistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads repository statistics with the required fullName query param", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: statistics });

    await expect(
      getGitHubRepositoryStatistics("sharek/frontend"),
    ).resolves.toEqual(statistics);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/github/repository/statistics",
      { params: { fullName: "sharek/frontend" } },
    );
  });

  it("loads a paginated repository page", async () => {
    const page = {
      items: [],
      page: 2,
      perPage: 12,
      hasNextPage: true,
    };
    mockedAxios.get.mockResolvedValueOnce({ data: page });

    await expect(
      listGitHubRepositories({ page: 2, perPage: 12 }),
    ).resolves.toEqual(page);

    expect(mockedAxios.get).toHaveBeenCalledWith("/github/repositories", {
      params: { page: 2, perPage: 12 },
    });
  });

  it("loads contribution activity with the required fullName query param", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: contributionActivity });

    await expect(
      getGitHubRepositoryContributionActivity("sharek/frontend"),
    ).resolves.toEqual(contributionActivity);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/github/repository/contribution-activity",
      { params: { fullName: "sharek/frontend" } },
    );
  });

  it("loads commit signals without an author filter when omitted", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: commitSignals });

    await expect(
      getGitHubRepositoryCommitSignals({ fullName: "sharek/frontend" }),
    ).resolves.toEqual(commitSignals);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/github/repository/commit-signals",
      { params: { fullName: "sharek/frontend" } },
    );
  });

  it("loads commit signals with an author filter when provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: commitSignals });

    await expect(
      getGitHubRepositoryCommitSignals({
        fullName: "sharek/frontend",
        author: "sara-dev",
      }),
    ).resolves.toEqual(commitSignals);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/github/repository/commit-signals",
      { params: { fullName: "sharek/frontend", author: "sara-dev" } },
    );
  });
});
