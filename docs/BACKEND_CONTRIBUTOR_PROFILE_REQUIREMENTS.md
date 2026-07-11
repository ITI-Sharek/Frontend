# Backend Requirements: Contributor Profile Redirect

This document defines the backend work required by the frontend contributor
profile redirect flow.

## Goal

After a contributor logs in successfully, the frontend calls the backend to
ensure the contributor has a profile, then redirects the user to:

```text
/profile/{username}
```

The current frontend expects these backend routes:

- `POST /auth/login`
- `GET /auth/me`
- `POST /contributors/profiles/me/ensure`
- `GET /contributors/profiles/:username`

All authenticated routes must accept:

```http
Authorization: Bearer <accessToken>
```

## 1. Auth Login Contract

### `POST /auth/login`

Authenticates a user and returns the authenticated user plus tokens.

### Request

```json
{
  "email": "contributor@example.com",
  "password": "Password123!"
}
```

### Success Response: `200 OK`

```json
{
  "user": {
    "id": "user_123",
    "email": "contributor@example.com",
    "username": "contributor007",
    "firstName": "Contributor",
    "lastName": "User",
    "avatarUrl": null,
    "role": "contributor",
    "status": "active",
    "preferredLanguage": "ar",
    "createdAt": "2026-07-10T10:00:00.000Z",
    "updatedAt": "2026-07-10T10:00:00.000Z",
    "lastLoginAt": "2026-07-10T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "expiresAt": "2026-07-10T10:15:00.000Z",
    "refreshExpiresAt": "2026-08-09T10:00:00.000Z"
  }
}
```

### Required Rules

- `user.username` is required.
- `user.role` must be one of: `owner`, `contributor`, `admin`.
- Contributor users must have a stable, unique username.
- Invalid credentials must return `401 Unauthorized`.
- Inactive/blocked users should not receive valid tokens.

## 2. Current User Contract

### `GET /auth/me`

Returns the current authenticated user. This is used when the user already has
an access token and visits the login page directly.

### Success Response: `200 OK`

Return the same `user` object shape used by `POST /auth/login`.

```json
{
  "id": "user_123",
  "email": "contributor@example.com",
  "username": "contributor007",
  "firstName": "Contributor",
  "lastName": "User",
  "avatarUrl": null,
  "role": "contributor",
  "status": "active",
  "preferredLanguage": "ar",
  "createdAt": "2026-07-10T10:00:00.000Z",
  "updatedAt": "2026-07-10T10:00:00.000Z",
  "lastLoginAt": "2026-07-10T10:00:00.000Z"
}
```

### Failure Responses

- `401 Unauthorized` if the access token is missing, expired, or invalid.

## 3. Ensure Current Contributor Profile

### `POST /contributors/profiles/me/ensure`

Returns the current contributor profile. If the authenticated user is a
contributor and no profile exists yet, create a basic profile and return it.

This endpoint is called immediately after successful contributor login.

### Authentication

Required.

```http
Authorization: Bearer <accessToken>
```

### Success Response: `200 OK` or `201 Created`

The frontend accepts either `200` or `201`, as long as the response body matches
this shape:

```json
{
  "username": "contributor007",
  "displayName": "Contributor User",
  "avatarUrl": null,
  "roleLabel": "Contributor",
  "bio": null,
  "skills": [],
  "availability": null,
  "githubStatus": {
    "connected": false,
    "username": null
  },
  "reputationSummary": {
    "rating": null,
    "reviewsCount": 0
  },
  "contributionHistory": [],
  "completionPrompts": [
    "Add your bio",
    "Add your skills",
    "Connect GitHub"
  ],
  "viewerRelationship": "owner"
}
```

### Required DTO Fields

```ts
interface ContributorProfileDto {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  roleLabel: string;
  bio: string | null;
  skills: Array<{
    id: string;
    name: string;
  }>;
  availability: string | null;
  githubStatus: {
    connected: boolean;
    username: string | null;
  };
  reputationSummary: {
    rating: number | null;
    reviewsCount: number;
  };
  contributionHistory: Array<{
    id: string;
    title: string;
    description: string | null;
    role: string | null;
  }>;
  completionPrompts: string[];
  viewerRelationship: "owner" | "authenticated-viewer";
}
```

### Required Rules

- Only users with `role = "contributor"` may auto-create contributor profiles.
- `owner` and `admin` users must not get contributor profiles from this route.
- The endpoint must be idempotent:
  - If the profile exists, return it.
  - If it does not exist, create it once and return it.
  - Repeated calls must not create duplicate profiles.
- `username` must be unique across users/profiles.
- The returned `username` must be the canonical username used in profile URLs.
- For the authenticated owner of the profile, return:
  - `viewerRelationship: "owner"`
  - `completionPrompts` with missing profile setup items.
- Optional arrays must return empty arrays, not `null`.
- Optional object fields must still be present.

### Suggested Profile Creation Defaults

When creating a new profile from a user:

- `username`: use `user.username`.
- `displayName`: use `${user.firstName} ${user.lastName}`.
- `avatarUrl`: use `user.avatarUrl`.
- `roleLabel`: use `"Contributor"` or localized equivalent.
- `bio`: `null`.
- `skills`: `[]`.
- `availability`: `null`.
- `githubStatus.connected`: `false`.
- `githubStatus.username`: `null`.
- `reputationSummary.rating`: `null`.
- `reputationSummary.reviewsCount`: `0`.
- `contributionHistory`: `[]`.

### Failure Responses

Use a consistent JSON error shape:

```json
{
  "statusCode": 409,
  "message": "Username is already used by another contributor profile.",
  "error": "Conflict"
}
```

Expected status codes:

- `401 Unauthorized`: token missing, expired, or invalid.
- `403 Forbidden`: authenticated user is not a contributor.
- `409 Conflict`: username/profile uniqueness conflict.
- `400 Bad Request`: invalid username or invalid profile source data.
- `422 Unprocessable Entity`: validation failed.
- `500 Internal Server Error`: unexpected server error.

## 4. Read Contributor Profile By Username

### `GET /contributors/profiles/:username`

Loads a contributor profile by username.

### Authentication

Required for the current frontend flow.

```http
Authorization: Bearer <accessToken>
```

### Route Parameter

```text
username = canonical contributor username
```

Example:

```http
GET /contributors/profiles/contributor007
```

### Success Response: `200 OK`

Return the same `ContributorProfileDto` shape.

```json
{
  "username": "contributor007",
  "displayName": "Contributor User",
  "avatarUrl": null,
  "roleLabel": "Contributor",
  "bio": "Frontend developer interested in open source.",
  "skills": [
    {
      "id": "skill_react",
      "name": "React"
    }
  ],
  "availability": "Available for part-time contribution",
  "githubStatus": {
    "connected": true,
    "username": "contributor007"
  },
  "reputationSummary": {
    "rating": 4.8,
    "reviewsCount": 12
  },
  "contributionHistory": [
    {
      "id": "history_123",
      "title": "Task management board",
      "description": "Implemented drag-and-drop board interactions.",
      "role": "Frontend Contributor"
    }
  ],
  "completionPrompts": [],
  "viewerRelationship": "authenticated-viewer"
}
```

### Required Rules

- If the authenticated viewer owns the profile:
  - return `viewerRelationship: "owner"`.
  - include `completionPrompts`.
- If the authenticated viewer does not own the profile:
  - return `viewerRelationship: "authenticated-viewer"`.
  - do not return private account/security fields.
  - `completionPrompts` should be `[]`.
- Do not expose password hashes, refresh tokens, access tokens, internal auth
  metadata, or private account fields.
- Unknown usernames must return `404 Not Found`.

### Failure Responses

- `401 Unauthorized`: token missing, expired, or invalid.
- `403 Forbidden`: viewer is authenticated but not allowed to view the profile.
- `404 Not Found`: no contributor profile exists for the username.
- `500 Internal Server Error`: unexpected server error.

## 5. Username Requirements

The frontend uses `username` in URLs:

```text
/profile/{username}
```

Backend requirements:

- Usernames must be stable.
- Usernames must be unique.
- Usernames should be URL-safe.
- Recommended format: lowercase letters, numbers, underscores, hyphens.
- Recommended regex:

```regex
^[a-z0-9][a-z0-9_-]{2,29}$
```

If existing users have emails but no username, the backend should generate a
unique username during registration or migration.

Example generation strategy:

- Base from email local-part or first/last name.
- Normalize to lowercase URL-safe slug.
- If taken, append a short numeric suffix.
- Persist the generated username on the user record.

## 6. Frontend Behavior To Support

The frontend flow is:

1. User submits login form.
2. Frontend calls `POST /auth/login`.
3. If `user.role !== "contributor"`, frontend uses the normal role destination.
4. If `user.role === "contributor"`, frontend stores the token.
5. Frontend calls `POST /contributors/profiles/me/ensure`.
6. Backend returns `ContributorProfileDto`.
7. Frontend redirects to `/profile/{profile.username}`.
8. Profile page calls `GET /contributors/profiles/:username`.
9. Backend returns the same profile DTO for rendering.

## 7. Acceptance Criteria

- Contributor login returns `user.username` and `user.role = "contributor"`.
- `POST /contributors/profiles/me/ensure` succeeds for contributor users.
- `POST /contributors/profiles/me/ensure` returns a complete renderable
  `ContributorProfileDto`.
- Repeating `POST /contributors/profiles/me/ensure` does not create duplicates.
- Non-contributor users receive `403 Forbidden` from the ensure endpoint.
- `GET /contributors/profiles/:username` returns a profile for valid usernames.
- `GET /contributors/profiles/:username` returns `404 Not Found` for unknown
  usernames.
- Profile responses never include tokens, password hashes, or private auth data.
- All failure responses include a useful `message` string.

## 8. Minimal Backend Test Scenarios

Please add API/integration tests for:

- Contributor login includes `username`.
- Contributor ensure profile creates a profile when missing.
- Contributor ensure profile returns the existing profile when already created.
- Contributor ensure profile rejects `owner` and `admin` users with `403`.
- Contributor profile lookup returns owner relationship for the profile owner.
- Contributor profile lookup returns authenticated-viewer relationship for
  another authenticated user.
- Unknown username returns `404`.
- Duplicate username conflict returns `409`.

