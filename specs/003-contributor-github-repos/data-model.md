# Data Model: Contributor GitHub Repositories

## GitHubAccountDto

Represents the authenticated contributor's connected GitHub account.

Fields used by this feature:

- `id`: Sharek-side account connection id.
- `githubId`: GitHub account id.
- `username`: GitHub username, rendered LTR.
- `avatarUrl`: Optional avatar URL.
- `profileUrl`: Optional GitHub profile URL.
- `ingestionStatus`: Existing GitHub ingestion status.
- `connectedAt`: Connection timestamp.
- `lastSyncedAt`: Optional sync timestamp.

Relationship: A connected account gates loading of repositories and repository statistics.

## GitHubRepositoryDto

Represents one repository returned by the connected GitHub account.

Fields:

- `githubRepoId`: GitHub repository id.
- `fullName`: Canonical `owner/name` value; required for statistics requests; rendered LTR.
- `name`: Repository name; rendered LTR.
- `owner`: Repository owner; rendered LTR.
- `description`: Optional repository description.
- `htmlUrl`: GitHub URL.
- `private`: Visibility flag.
- `fork`: Fork flag.
- `archived`: Archive flag.
- `defaultBranch`: Default branch name; rendered LTR.
- `primaryLanguage`: Optional primary language.
- `languages`: Language byte map.
- `stars`, `forks`, `openIssues`, `watchers`: Repository counters.
- `topics`: Repository topics.
- `pushedAt`, `updatedAt`: Optional timestamps.

Relationship: Selecting a repository by `fullName` loads repository statistics.

## GitHubRepositoryStatisticsDto

Represents summary metadata plus both statistics blocks for one selected repository.

Fields:

- `stars`, `forks`, `openIssues`, `watchers`: Summary counters.
- `fork`, `archived`: Repository flags.
- `defaultBranch`: Default branch name.
- `pushedAt`, `updatedAt`: Optional timestamps.
- `contributionActivity`: Contribution activity block.
- `commitSignals`: Commit signals block.

Relationship: Aggregates `GitHubRepositoryContributionActivityDto` and `GitHubRepositoryCommitSignalsDto`.

## GitHubRepositoryContributionActivityDto

Represents contribution activity for one selected repository.

Fields:

- `totalContributors`: Total contributor count.
- `totalCommits`: Total commit count.
- `lastYearCommitCount`: Commit count across the last year.
- `weeklyCommitCounts`: Ordered weekly commit counts.
- `topContributors`: Contributors with login, profile URL, commits, additions, and deletions.
- `unavailableReason`: `null` when available, otherwise a provider/statistics availability reason.

State rules:

- `github_stats_pending` means still calculating and should show a retry-later state.
- Other unavailable reasons show a graceful unavailable state scoped to the contribution block.

## GitHubRepositoryCommitSignalsDto

Represents recent commit signals for one selected repository.

Fields:

- `recentCommitCount`: Number of recent commits returned/analyzed.
- `latestCommitAt`, `oldestCommitAt`: Optional date range.
- `authors`: Author login list; rendered LTR.
- `recentCommits`: Commit rows with SHA, URL, message headline, author login, and authored date.
- `unavailableReason`: `null` when available, otherwise a provider/statistics availability reason.

State rules:

- `github_stats_pending` means still calculating and should show a retry-later state.
- Empty `recentCommits` with no unavailable reason is a valid empty block, not an error.

## Unavailable Reason

Known values:

- `github_stats_pending`
- `github_no_content`
- `github_not_found`
- `github_repository_empty_or_unavailable`
- `github_http_<status>`

Validation rule: Unknown future strings should still render as graceful unavailable states rather than crash.
