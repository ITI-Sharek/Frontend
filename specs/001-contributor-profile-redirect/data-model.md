# Data Model: Contributor Profile Redirect

## ContributorUser

Represents an authenticated user who may be routed after login.

**Fields**

- `id`: Unique user identifier.
- `email`: User email address; private, not shown on public profile cards.
- `username`: Unique canonical profile identifier.
- `firstName`: Contributor first name.
- `lastName`: Contributor last name.
- `avatarUrl`: Optional profile avatar.
- `role`: One of `contributor`, `owner`, or `admin`.
- `status`: Account status used by existing authentication flows.

**Validation Rules**

- `username` is required for contributor profile routing.
- `username` must be unique across users.
- Only `role = contributor` receives the contributor-profile post-login redirect.

## ContributorProfile

Represents the contributor-facing profile shown after login and to authenticated viewers.

**Fields**

- `username`: Unique profile route identifier.
- `displayName`: Public display name.
- `avatarUrl`: Optional avatar image URL.
- `roleLabel`: Contributor role label.
- `bio`: Optional introduction.
- `skills`: List of contributor skills.
- `availability`: Optional availability status or summary.
- `githubStatus`: Connection state and safe public GitHub summary.
- `reputationSummary`: Aggregate public reputation information.
- `contributionHistory`: Public project/contribution history entries.
- `completionPrompts`: Owner-only prompts for missing profile sections.
- `viewerRelationship`: Indicates whether the current viewer is the profile owner or another authenticated user.

**Validation Rules**

- A contributor profile must resolve by `username`.
- Public/non-owner responses must not include private authentication details, security tokens, private email, or hidden account fields.
- Missing optional sections must produce empty-state metadata or user-facing prompts.
- First successful contributor login must create a basic profile if none exists.

## ProfileIdentifier

Represents the stable route value used for profile navigation.

**Fields**

- `username`: Canonical contributor profile identifier.

**Validation Rules**

- Must match exactly one contributor profile.
- Unknown usernames produce a not-found or recovery state.

## LoginSession

Represents the successful authenticated session used to decide where the user lands after login.

**Fields**

- `user`: Authenticated user summary including `role` and `username`.
- `tokens`: Existing authentication token payload.

**State Transitions**

1. Anonymous user submits valid credentials.
2. Login session is created.
3. If `user.role = contributor`, the system ensures a contributor profile exists.
4. Contributor is redirected to the profile route for `user.username`.
5. If `user.role` is not contributor, the user follows the existing role-based destination.

## Profile View States

- `loading`: Profile is being resolved.
- `ready-owner`: Contributor is viewing their own profile, including completion prompts.
- `ready-authenticated-viewer`: Another authenticated user is viewing public contributor information.
- `empty-sections`: Profile exists but optional sections are missing.
- `not-found`: Username does not resolve to a contributor profile.
- `error`: Profile cannot be loaded due to unavailable data or network failure.
