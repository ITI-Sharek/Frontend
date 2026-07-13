# Research: Contributor GitHub Repositories

## Decision: Gate repository calls on GitHub account status

**Rationale**: The backend exposes `GET /github/account` for connection status and the feature brief explicitly says repository endpoints must not be called when no GitHub account is connected. The UI will load account status first, treat a missing account as a connect-GitHub state, and enable repository/statistics queries only after a connected account is available.

**Alternatives considered**: Calling `/github/repositories` directly and interpreting 404/403 as disconnected was rejected because it violates the backend usage guidance and creates avoidable error states.

## Decision: Use one repository list endpoint for public and private repositories

**Rationale**: The backend contract states `GET /github/repositories` returns repositories according to the OAuth scope granted, including private repositories for contributors that granted `repo` scope. The frontend should display the returned list exactly and label visibility, not split public/private into separate flows.

**Alternatives considered**: Adding separate private/public filters or endpoints was rejected because there is no separate backend endpoint and it would imply control the frontend does not have.

## Decision: Statistics unavailable reasons are soft block-level states

**Rationale**: Contribution activity and commit signals can return `unavailableReason` values such as `github_stats_pending`, `github_no_content`, `github_not_found`, `github_repository_empty_or_unavailable`, and `github_http_<status>`. These are provider/statistics availability states, not whole-page failures, so the statistics panel should show Arabic explanatory copy for the affected block while keeping the repository list usable.

**Alternatives considered**: Treating unavailable reasons as query errors was rejected because it would incorrectly frame expected GitHub behavior as an application crash.

## Decision: Keep route path local to the new route file

**Rationale**: DEC-029 permits the feature only if files touched by `001-contributor-profile-redirect` are not modified. `src/config/routes.config.ts` is frozen, so the new route defines `/github/repositories` as a local constant and uses that value for the OAuth return path until route config can be reconciled after 001 lands.

**Alternatives considered**: Editing `routes.config.ts` was rejected because it is explicitly forbidden for this feature. Hiding the feature behind an existing route was rejected because it would collide with 001-owned contributor profile/dashboard work.

## Decision: Arabic UI with LTR technical tokens

**Rationale**: Existing contributor UI copy is Arabic and the design inventory states repo names, skill names, and technical values remain LTR in RTL layouts. The component will use Arabic labels while applying `dir="ltr"` to repository full names, owners, branch names, commit SHAs, usernames, and URLs.

**Alternatives considered**: English UI copy was rejected because it would be inconsistent with the current frontend state and the requested RTL-aware behavior.

## Decision: Test query behavior through query option factories

**Rationale**: The existing test style uses Vitest and React server rendering, without a DOM testing library. Query hooks will expose query-option builder functions used by the hooks, allowing deterministic tests of query keys, enabled gates, and query functions without introducing new dev dependencies.

**Alternatives considered**: Adding a hook testing library was rejected because the repo does not currently depend on one and the same behavior can be covered through small exported option factories.
