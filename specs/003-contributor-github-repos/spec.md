# Feature Specification: Contributor GitHub Repositories

**Feature Branch**: `003-contributor-github-repos`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "Contributor-facing GitHub repositories list and per-repository statistics view"

**Grounded in**: `docs/governance/decision-log.md` DEC-029 (one-off exception to DEC-028); `docs/design/screen-inventory.md` sections 1.8, 2.1, 3.1, and 3.7 (profile/dashboard, GitHub connection, skill/repo LTR-in-RTL conventions); `docs/design/user-journeys.md` CJ-1 (GitHub connection and analysis context); backend GitHub endpoints already implemented for account status, repository listing, and repository statistics.

**Scope note**: DEC-029 permits this feature to proceed now while `001-contributor-profile-redirect` remains in flight, but only as additive work that does not modify files already touched by 001. This feature adds a contributor-facing view for the contributor's own connected GitHub repositories and statistics. It does not import repositories into projects, edit repository metadata, or perform background synchronization.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View my connected repositories (Priority: P1)

An authenticated contributor opens "My GitHub repositories" and sees the repositories available through their connected GitHub account, including private repositories when their OAuth grant allows them. The list gives enough context to recognize each repository: owner/name, visibility, fork/archive status, language, topics, and basic counts.

**Why this priority**: The repository list is the feature's entry point and validates that the contributor's GitHub connection is useful beyond onboarding. Without it, there is no path to repository-level statistics.

**Independent Test**: Can be fully tested by rendering the page with a connected account and a repository list response, then confirming public and private repositories appear with recognizable metadata and LTR repository names inside the Arabic RTL page.

**Acceptance Scenarios**:

1. **Given** the contributor has a connected GitHub account, **When** the repository list is loading, **Then** the page shows an Arabic loading state rather than a blank screen.
2. **Given** the contributor has a connected GitHub account with repositories, **When** the repository list loads, **Then** every returned repository is shown, including private repositories returned by the backend.
3. **Given** a repository is private, forked, or archived, **When** it appears in the list, **Then** the card labels those states clearly without hiding the repository.
4. **Given** the page is rendered in Arabic/RTL, **When** repository names, GitHub owners, branch names, and short technical tokens appear, **Then** those values remain left-to-right while surrounding UI mirrors correctly.
5. **Given** the repository list request fails, **When** the page renders the failure state, **Then** the contributor sees a retryable Arabic error state and no repository details are fabricated.

---

### User Story 2 - Connect GitHub before loading repositories (Priority: P1)

An authenticated contributor who has not connected GitHub opens the section and gets a focused empty state that explains GitHub must be connected before repositories can be listed. The repository endpoints are not called until an account is connected.

**Why this priority**: Calling repository endpoints for disconnected users creates avoidable errors and a confusing experience. The connect state is equally required for the MVP because GitHub connection is a prerequisite in CJ-1.

**Independent Test**: Can be fully tested by rendering the page with no connected GitHub account and confirming the connect CTA is shown while repository/statistics calls are not started.

**Acceptance Scenarios**:

1. **Given** the contributor has no connected GitHub account, **When** the section loads account status, **Then** the page shows a "connect GitHub" empty state in Arabic.
2. **Given** the no-account state is displayed, **When** the contributor activates the CTA, **Then** the existing GitHub connect flow starts and returns the contributor to this section.
3. **Given** the account-status request is still loading, **When** the page renders, **Then** the page shows a loading state and does not call repository or statistics endpoints yet.

---

### User Story 3 - Inspect repository statistics (Priority: P2)

From the repository list, a contributor selects a repository and sees statistics for that repository: summary counts, contribution activity, top contributors, weekly commit counts, recent commit signals, and recent commits. The view distinguishes temporary/statistical unavailability from hard request errors.

**Why this priority**: Repository-level drill-down is the feature's deeper value: it helps contributors understand how their connected GitHub work looks through Sharek's activity lens. It can be delivered after the list because it depends on selecting a repository.

**Independent Test**: Can be fully tested by selecting a repository from a loaded list and returning a statistics response with contribution activity and commit signals, then confirming the statistics panel updates for the selected repository.

**Acceptance Scenarios**:

1. **Given** a repository card is visible, **When** the contributor selects it, **Then** the section requests statistics using that repository's full name.
2. **Given** statistics load successfully, **When** the panel renders, **Then** the contributor sees summary counts, contribution activity totals, weekly commit activity, top contributors, recent commit authors, and recent commits.
3. **Given** GitHub returns `github_stats_pending` for contribution activity or commit signals, **When** the panel renders, **Then** the contributor sees a "still calculating, try again shortly" state rather than a hard error.
4. **Given** GitHub returns `github_no_content`, `github_not_found`, `github_repository_empty_or_unavailable`, or `github_http_<status>` as an unavailable reason, **When** the panel renders, **Then** the contributor sees a graceful unavailable message scoped to that statistics block.
5. **Given** a statistics-family request fails as a network/auth/server error, **When** the panel renders, **Then** the contributor sees a retryable error state and the repository list remains usable.

### Edge Cases

- Connected GitHub account exists but returns zero repositories: show an Arabic empty state that explains no repositories were returned for the granted OAuth access; do not offer project import or paste fallback in this contributor section.
- Repository has no description, language, topics, pushed date, or updated date: show a neutral placeholder only for the missing field and keep the card layout stable.
- Repository language bytes are missing or empty: omit the language distribution visualization rather than showing misleading percentages.
- `fullName` is required for all statistics-family requests: no statistics request is made until a selected repository has a non-empty `owner/name` full name.
- Repository full names, usernames, branch names, commit SHAs, and GitHub URLs stay left-to-right inside RTL layout.
- Recent commits may be empty even when totals exist: show an empty recent-commit state for that block only.
- The selected repository may disappear after a refetch: clear the selection or prompt the contributor to choose another returned repository.
- GitHub API rate-limit or provider errors may appear as `github_http_<status>` unavailable reasons: present them as temporary/unavailable statistics states, not as whole-page crashes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The section MUST be available only to authenticated contributors through the authenticated app layout.
- **FR-002**: The section MUST check whether the contributor has a connected GitHub account before requesting repositories.
- **FR-003**: If no GitHub account is connected, the section MUST show a GitHub-connect empty state and MUST NOT request repository or repository-statistics data.
- **FR-004**: The GitHub-connect CTA MUST reuse the existing in-app GitHub connect flow and return the contributor to this section after OAuth completion.
- **FR-005**: The repository list MUST show all repositories returned by the backend repository list, including public and private repositories when present in the response.
- **FR-006**: Each repository list item MUST show the repository full name, description when present, visibility, fork/archive states, default branch, primary language, topics, stars, forks, open issues, watchers, pushed date, updated date, and a GitHub link when available.
- **FR-007**: The section MUST provide loading, empty, and retryable error states for account status and repository list loading.
- **FR-008**: The contributor MUST be able to select one repository from the list to view repository-level statistics.
- **FR-009**: The statistics view MUST request statistics only with a non-empty repository full name.
- **FR-010**: The statistics view MUST show repository summary counts and metadata returned with the statistics response.
- **FR-011**: The statistics view MUST show contribution activity totals, weekly commit counts, and top contributors when those values are available.
- **FR-012**: The statistics view MUST show recent commit signals, author filters/signals, latest/oldest commit dates, and recent commits when those values are available.
- **FR-013**: The UI MUST treat `github_stats_pending` as a temporary "still calculating, try again shortly" state, not as a hard error.
- **FR-014**: The UI MUST gracefully handle `github_no_content`, `github_not_found`, `github_repository_empty_or_unavailable`, and `github_http_<status>` unavailable reasons for contribution activity and commit signals without crashing the whole page.
- **FR-015**: Repository names, owner names, branch names, commit SHAs, usernames, and GitHub URLs MUST render left-to-right within the Arabic RTL page.
- **FR-016**: The section MUST NOT include repository import into a project, repository metadata editing, or background sync/re-analysis controls.
- **FR-017**: The feature MUST include automated coverage for query hooks and the main repository list component's empty, error, and loaded states.

### Key Entities *(include if feature involves data)*

- **GitHub account**: The contributor's connected GitHub identity and ingestion status, used only to determine whether repository data can be loaded and to display connection context.
- **GitHub repository**: A repository returned for the connected account, identified by GitHub repo id and `owner/name` full name, with metadata, visibility, language, topic, and count fields.
- **Repository statistics**: Repository-level counts and metadata plus contribution activity and recent commit signals for one selected repository.
- **Contribution activity**: A statistics block containing contributor counts, commit totals, weekly counts, top contributors, and an optional unavailable reason.
- **Commit signals**: A statistics block containing recent commit counts, date range, authors, recent commits, and an optional unavailable reason.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A connected contributor can open the section and identify a specific repository from the returned list within 10 seconds under normal network conditions.
- **SC-002**: 100% of disconnected-account visits show the connect-GitHub empty state and make zero repository/statistics requests before connection.
- **SC-003**: A contributor can select a repository and see either loaded statistics or a graceful block-level unavailable state within one interaction after the repository list appears.
- **SC-004**: A component test verifies the main list component renders the disconnected empty state, a retryable error state, and loaded public/private repository cards.
- **SC-005**: Query hook tests verify account-gated repository loading and statistics queries keyed by repository full name.
- **SC-006**: Arabic RTL rendering keeps repository full names and commit SHAs readable left-to-right at mobile and desktop widths.

## Assumptions

- The backend endpoints named in the input are implemented and authenticated: account status, repository list, repository statistics, contribution activity, and commit signals.
- Private repository visibility is governed by the GitHub OAuth scope already granted; the frontend displays whatever repositories the backend returns and does not request a separate private-repository endpoint.
- The user viewing this section is the authenticated contributor whose GitHub account is connected; public viewing of another contributor's repositories is out of scope.
- Repository statistics are read-only and provider-derived; Sharek does not mutate GitHub or repository metadata in this feature.
- The section may be linked manually or added to navigation later; because current navigation/config files touched by 001 are frozen, this feature can define its route path locally until those files are safe to reconcile.
