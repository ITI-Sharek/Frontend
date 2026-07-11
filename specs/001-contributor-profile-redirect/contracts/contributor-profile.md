# Contract: Contributor Profile Redirect

This contract defines the frontend-facing behavior expected from the authentication and contributor profile capabilities. Endpoint names are descriptive and may map to existing backend routes during implementation.

## Login Success Contract

### Operation: Authenticate User

**Purpose**: Authenticate credentials and return enough user information to select the correct post-login destination.

**Request**

- `email`: User email.
- `password`: User password.

**Successful Response**

- `user.id`
- `user.email`
- `user.username`
- `user.firstName`
- `user.lastName`
- `user.avatarUrl`
- `user.role`
- `user.status`
- `tokens.accessToken`
- `tokens.refreshToken`
- `tokens.expiresAt`
- `tokens.refreshExpiresAt`

**Rules**

- If `user.role = contributor`, the frontend must route to the contributor profile for `user.username` after ensuring a profile exists.
- If `user.role != contributor`, the frontend must use the existing role-based destination.
- Invalid credentials must not redirect.

## Ensure Contributor Profile Contract

### Operation: Ensure Current Contributor Profile

**Purpose**: Return the current contributor's profile, creating a basic profile if none exists.

**Request**

- Authenticated contributor session.

**Successful Response**

- `profile.username`
- `profile.displayName`
- `profile.avatarUrl`
- `profile.roleLabel`
- `profile.bio`
- `profile.skills`
- `profile.availability`
- `profile.githubStatus`
- `profile.reputationSummary`
- `profile.contributionHistory`
- `profile.completionPrompts`
- `profile.viewerRelationship = owner`

**Rules**

- Must only auto-create profiles for contributor users.
- Must not create contributor profiles for owner/admin users.
- Must return a renderable basic profile even when optional fields are empty.

## Contributor Profile Read Contract

### Operation: Get Contributor Profile By Username

**Purpose**: Load a contributor profile for an authenticated viewer.

**Request**

- `username`: Canonical profile identifier.
- Authenticated viewer session.

**Successful Owner Response**

- Full public profile fields.
- Owner-only `completionPrompts`.
- `viewerRelationship = owner`.

**Successful Non-Owner Authenticated Response**

- Public contributor profile fields.
- `viewerRelationship = authenticated-viewer`.
- No private account details, authentication details, security tokens, or hidden fields.

**Failure Responses**

- `unauthenticated`: Viewer must sign in before viewing the profile.
- `not-found`: Username does not resolve to a contributor profile.
- `forbidden`: Viewer is authenticated but not allowed to view this profile.
- `unavailable`: Profile data cannot be loaded; user can retry.

## UI State Contract

The contributor profile UI must support:

- Profile loading state.
- Owner profile ready state with completion prompts.
- Authenticated non-owner ready state with private fields hidden.
- Optional-section empty states.
- Not-found state for unknown usernames.
- Retryable error state for unavailable profile data.
