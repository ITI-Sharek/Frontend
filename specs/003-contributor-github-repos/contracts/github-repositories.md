# UI/API Contract: Contributor GitHub Repositories

The frontend consumes already-implemented authenticated backend endpoints. All calls use the existing configured axios instance.

## Account Status

`GET /github/account`

Response when connected: `GitHubAccountDto`

Frontend behavior:

- Load this before repository/statistics queries.
- If no connected account is reported, show the connect-GitHub empty state.
- Do not call repository/statistics endpoints until connected.

## Repository List

`GET /github/repositories`

Response: `GitHubRepositoryDto[]`

Frontend behavior:

- Render every returned repository, public or private.
- Use `fullName` as the stable selection key and statistics query parameter.
- Empty array renders a no-repositories empty state.

## Repository Statistics

`GET /github/repository/statistics?fullName=owner/repo`

Response:

```ts
{
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
```

Frontend behavior:

- Request only after a repository with a non-empty `fullName` is selected.
- Use this as the primary statistics panel data source.
- Show retryable error if the request itself fails.

## Contribution Activity

`GET /github/repository/contribution-activity?fullName=owner/repo`

Response: `GitHubRepositoryContributionActivityDto`

Frontend behavior:

- Query hook is provided for direct block-level consumption or future reuse.
- `unavailableReason` is rendered as a block-level state.

## Commit Signals

`GET /github/repository/commit-signals?fullName=owner/repo&author=optional`

Response: `GitHubRepositoryCommitSignalsDto`

Frontend behavior:

- Query hook is provided for direct block-level consumption or future reuse.
- Omit `author` when no author filter is selected.
- `unavailableReason` is rendered as a block-level state.

## Required Query Parameter Rule

`fullName` is required on the three statistics-family endpoints. The frontend must not invoke those service/query functions from UI until a non-empty full name is available. If a caller violates this contract, the backend may return `400 GITHUB_REPOSITORY_FULL_NAME_REQUIRED`.

## Unavailable Reason Handling

Known soft states:

- `github_stats_pending`: show "still calculating, try again shortly" copy.
- `github_no_content`: show that GitHub has no statistics content for this repository.
- `github_not_found`: show that GitHub could not find or authorize the repository statistics.
- `github_repository_empty_or_unavailable`: show that the repository appears empty or unavailable.
- `github_http_<status>`: show a temporary GitHub provider error/rate-limit style message.

These reasons are not whole-page hard errors.
