import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ContributorGitHubRepositoriesSection,
  getUnavailableReasonMessage,
} from "./contributor-github-repositories-section";
import type {
  GitHubAccountDto,
  GitHubRepositoryDto,
  GitHubRepositoryStatisticsDto,
} from "../types/github.types";

const account: GitHubAccountDto = {
  id: "account-1",
  githubId: "123",
  username: "sara-dev",
  avatarUrl: null,
  profileUrl: "https://github.com/sara-dev",
  ingestionStatus: "completed",
  connectedAt: "2026-07-01T12:00:00.000Z",
  lastSyncedAt: null,
};

const repositories: GitHubRepositoryDto[] = [
  {
    githubRepoId: "repo-1",
    fullName: "sara-dev/public-ui",
    name: "public-ui",
    owner: "sara-dev",
    description: "Public UI repository",
    htmlUrl: "https://github.com/sara-dev/public-ui",
    private: false,
    fork: false,
    archived: false,
    defaultBranch: "main",
    primaryLanguage: "TypeScript",
    languages: { TypeScript: 1000 },
    stars: 12,
    forks: 3,
    openIssues: 1,
    watchers: 5,
    topics: ["react"],
    pushedAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T13:00:00.000Z",
  },
  {
    githubRepoId: "repo-2",
    fullName: "sara-dev/private-api",
    name: "private-api",
    owner: "sara-dev",
    description: null,
    htmlUrl: "https://github.com/sara-dev/private-api",
    private: true,
    fork: true,
    archived: true,
    defaultBranch: "trunk",
    primaryLanguage: null,
    languages: {},
    stars: 0,
    forks: 0,
    openIssues: 0,
    watchers: 1,
    topics: [],
    pushedAt: null,
    updatedAt: null,
  },
];

const statistics: GitHubRepositoryStatisticsDto = {
  stars: 12,
  forks: 3,
  openIssues: 1,
  watchers: 5,
  fork: false,
  archived: false,
  defaultBranch: "main",
  pushedAt: "2026-07-12T12:00:00.000Z",
  updatedAt: "2026-07-12T13:00:00.000Z",
  contributionActivity: {
    totalContributors: 2,
    totalCommits: 24,
    lastYearCommitCount: 12,
    weeklyCommitCounts: [0, 1, 3],
    topContributors: [
      {
        login: "sara-dev",
        profileUrl: "https://github.com/sara-dev",
        commits: 24,
        additions: 100,
        deletions: 20,
      },
    ],
    unavailableReason: null,
  },
  commitSignals: {
    recentCommitCount: 1,
    latestCommitAt: "2026-07-12T12:00:00.000Z",
    oldestCommitAt: "2026-07-10T12:00:00.000Z",
    authors: ["sara-dev"],
    recentCommits: [
      {
        sha: "abcdef123456",
        htmlUrl: "https://github.com/sara-dev/public-ui/commit/abcdef1",
        messageHeadline: "Add repository cards",
        authorLogin: "sara-dev",
        authoredAt: "2026-07-12T12:00:00.000Z",
      },
    ],
    unavailableReason: null,
  },
};

function renderSection(
  overrides: Partial<
    Parameters<typeof ContributorGitHubRepositoriesSection>[0]
  > = {},
) {
  return renderToStaticMarkup(
    <ContributorGitHubRepositoriesSection
      accountState={{ status: "connected", account }}
      repositoriesState={{ status: "loaded", repositories }}
      selectedFullName={null}
      statisticsState={{ status: "idle" }}
      onConnectGitHub={vi.fn()}
      onSelectRepository={vi.fn()}
      {...overrides}
    />,
  );
}

describe("ContributorGitHubRepositoriesSection", () => {
  it("renders the disconnected GitHub empty state", () => {
    const html = renderSection({
      accountState: { status: "not-connected" },
      repositoriesState: { status: "idle" },
    });

    expect(html).toContain("اربط حساب GitHub أولاً");
    expect(html).toContain("ربط GitHub");
    expect(html).not.toContain("sara-dev/public-ui");
  });

  it("renders a retryable repository error state", () => {
    const html = renderSection({
      repositoriesState: {
        status: "error",
        message: "Network down",
      },
    });

    expect(html).toContain("تعذر تحميل المستودعات");
    expect(html).toContain("Network down");
    expect(html).toContain("إعادة المحاولة");
  });

  it("renders public and private repositories with LTR technical names", () => {
    const html = renderSection();

    expect(html).toContain("sara-dev/public-ui");
    expect(html).toContain("sara-dev/private-api");
    expect(html).toContain('dir="ltr"');
    expect(html).toContain("عام");
    expect(html).toContain("خاص");
    expect(html).toContain("مؤرشف");
  });

  it("renders loaded repository statistics and recent commits", () => {
    const html = renderSection({
      selectedFullName: "sara-dev/public-ui",
      statisticsState: { status: "loaded", statistics },
    });

    expect(html).toContain("إحصاءات المستودع");
    expect(html).toContain("نشاط المساهمة");
    expect(html).toContain("إشارات الالتزامات الحديثة");
    expect(html).toContain("Add repository cards");
    expect(html).toContain("abcdef1");
  });

  it("renders pending statistics as an unavailable block state", () => {
    const html = renderSection({
      selectedFullName: "sara-dev/public-ui",
      statisticsState: {
        status: "loaded",
        statistics: {
          ...statistics,
          contributionActivity: {
            ...statistics.contributionActivity,
            unavailableReason: "github_stats_pending",
          },
        },
      },
    });

    expect(html).toContain("لا تزال GitHub تحسب هذه الإحصاءات");
  });

  it("maps provider HTTP unavailable reasons to graceful copy", () => {
    expect(getUnavailableReasonMessage("github_http_403")).toContain(
      "أعاد GitHub حالة مؤقتة",
    );
  });
});
