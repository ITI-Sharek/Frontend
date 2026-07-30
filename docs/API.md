# Sharek Backend API - REST Client guide
#
# How to use:
# 1. Install the VS Code extension: REST Client.
# 2. Run the backend locally. Default URL is http://localhost:4000 (approved
#    local ports per DEC-023: frontend 3001, backend 4000, Postgres 5432,
#    Redis 6379). Routes are unprefixed — no /api base path (DEC-024).
# 3. Open this file and click "Send Request" above any request.
# 4. Start with Health, then Register/Login, then protected requests.
# 5. Do not run every request blindly. Some requests are optional, like
#    GitHub disconnect, admin role assignment, refresh, and logout.
#
# Important:
# - Public endpoint: no Authorization header needed.
# - Protected endpoint: must send "Authorization: Bearer <accessToken>".
# - The login response returns:
#   {
#     "user": { ... },
#     "tokens": {
#       "accessToken": "...",
#       "refreshToken": "...",
#       "expiresAt": "...",
#       "refreshExpiresAt": "..."
#     }
#   }
# - If register returns EMAIL_TAKEN, the user already exists. Run Login instead.
# - Keep Logout near the end. Logout revokes the session, so later protected
#   requests with the same token will return 401.
# - Refresh creates a new access token for the same session. After refresh,
#   the old login access token is no longer the active token.

@baseUrl = http://localhost:4000
@ownerEmail = owner@example.com
@contributorEmail = contributor@example.com
@adminEmail = admin@example.com
@password = Password123!
@githubRepoFullName = openai/openai-node
@userIdToPromote = replace-with-real-user-id


### 01 - Health check
# What it does:
# Checks if the backend server is alive.
#
# Auth:
# Public.
#
# Expected success response:
# {
#   "status": "ok"
# }
GET {{baseUrl}}/health


### 02 - Register owner user
# @name ownerRegister
# What it does:
# Creates a new user with role "owner".
#
# Auth:
# Public.
#
# Body rules:
# - email must be valid.
# - password must be at least 8 characters.
# - role must be "owner" or "contributor".
# - preferredLanguage must be "en" or "ar".
#
# Expected success response:
# Auth session object: user + tokens.
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "{{ownerEmail}}",
  "password": "{{password}}",
  "firstName": "Sharek",
  "lastName": "Owner",
  "role": "owner",
  "preferredLanguage": "en"
}


### 03 - Register contributor user
# @name contributorRegister
# What it does:
# Creates a normal contributor account.
#
# Auth:
# Public.
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "{{contributorEmail}}",
  "password": "{{password}}",
  "firstName": "Sharek",
  "lastName": "Contributor",
  "role": "contributor",
  "preferredLanguage": "ar"
}


### 04 - Login as owner
# @name ownerLogin
# What it does:
# Logs in with email/password and returns user + tokens.
#
# Auth:
# Public.
#
# Frontend usage:
# - Store accessToken for API calls.
# - Store refreshToken if the app supports session refresh.
# - Send accessToken as:
#   Authorization: Bearer <accessToken>
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "{{ownerEmail}}",
  "password": "{{password}}"
}


### 05 - Get current logged-in user
# What it does:
# Returns the profile of the user connected to the access token.
#
# Auth:
# Protected. Uses the access token from "04 - Login as owner".
#
# Expected success response:
# AuthUserDto:
# {
#   "id": "...",
#   "email": "...",
#   "firstName": "...",
#   "lastName": "...",
#   "avatarUrl": null,
#   "role": "owner",
#   "status": "active",
#   "preferredLanguage": "en",
#   "createdAt": "...",
#   "updatedAt": "...",
#   "lastLoginAt": "..."
# }
GET {{baseUrl}}/auth/me
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 06 - Start GitHub OAuth connection
# What it does:
# Starts GitHub connect flow for the logged-in user.
#
# Auth:
# Protected.
#
# Expected success response:
# {
#   "authorizationUrl": "https://github.com/login/oauth/authorize?...",
#   "state": "...",
#   "expiresAt": "..."
# }
#
# Frontend usage:
# Redirect the browser to authorizationUrl.
GET {{baseUrl}}/github/oauth/start
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 07 - GitHub OAuth callback from browser redirect
# What it does:
# This is the redirect endpoint GitHub can call after the user approves access.
#
# Auth:
# Public. The security check is the OAuth state value.
#
# Frontend note:
# In a real browser flow, GitHub redirects to this URL with code and state.
# Replace both values before testing manually.
GET {{baseUrl}}/github/oauth/callback?code=replace-with-github-code&state=replace-with-oauth-state


### 08 - GitHub OAuth callback from frontend
# What it does:
# Connects the GitHub account when the frontend receives code/state and sends
# them to the backend.
#
# Auth:
# Public. The security check is the OAuth state value.
#
# Body:
# - code: value returned by GitHub.
# - state: value returned by "06 - Start GitHub OAuth connection".
POST {{baseUrl}}/github/oauth/callback
Content-Type: application/json

{
  "code": "replace-with-github-code",
  "state": "replace-with-oauth-state"
}


### 09 - Get connected GitHub account
# What it does:
# Returns the GitHub account connected to the logged-in user.
#
# Auth:
# Protected.
#
# Expected success response:
# GitHubAccountDto:
# {
#   "id": "...",
#   "githubId": "...",
#   "username": "...",
#   "avatarUrl": "...",
#   "profileUrl": "...",
#   "ingestionStatus": "pending|in_progress|completed|failed",
#   "connectedAt": "...",
#   "lastSyncedAt": null
# }
GET {{baseUrl}}/github/account
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 10 - List GitHub repositories
# What it does:
# Lists repositories available from the connected GitHub account.
#
# Auth:
# Protected.
#
# Expected success response:
# Array of GitHubRepositoryDto.
GET {{baseUrl}}/github/repositories
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 11 - Import GitHub project
# What it does:
# Imports or refreshes a project from a GitHub repository full name.
#
# Auth:
# Protected. Role must be "owner" or "admin".
#
# Body rules:
# - fullName must look like "owner/repository".
#
# Expected success response:
# ImportedProjectDto:
# {
#   "id": "...",
#   "ownerId": "...",
#   "title": "...",
#   "description": "...",
#   "githubRepoUrl": "...",
#   "githubRepoId": "...",
#   "languages": ...,
#   "tags": ...,
#   "technologies": ...,
#   "repoStatistics": ...,
#   "status": "draft",
#   "readmeContent": "...",
#   "createdAt": "...",
#   "updatedAt": "..."
# }
POST {{baseUrl}}/projects/import/github
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}
Content-Type: application/json

{
  "fullName": "{{githubRepoFullName}}"
}


### 12 - Disconnect GitHub account
# What it does:
# Removes the connected GitHub account/token for the logged-in user.
#
# Auth:
# Protected.
#
# Expected success response:
# {
#   "success": true
# }
#
# Important:
# Run this only when you really want to disconnect the test GitHub account.
DELETE {{baseUrl}}/github/account
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 13 - Login as admin
# @name adminLogin
# What it does:
# Logs in as an existing admin user.
#
# Important:
# The register endpoint does not allow creating admin users directly.
# You need an admin user already created in the database.
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "{{adminEmail}}",
  "password": "{{password}}"
}


### 14 - Assign user role
# What it does:
# Changes a user's role to owner, contributor, or admin.
#
# Auth:
# Protected. Role must be "admin".
#
# Important:
# - Replace @userIdToPromote at the top with a real user id.
# - This uses the token from "13 - Login as admin".
# - If you use an owner/contributor token, the backend should return 403.
PATCH {{baseUrl}}/auth/users/{{userIdToPromote}}/role
Authorization: Bearer {{adminLogin.response.body.$.tokens.accessToken}}
Content-Type: application/json

{
  "role": "admin"
}


### 15 - Refresh owner tokens
# @name ownerRefresh
# What it does:
# Takes a refresh token and returns a new accessToken + refreshToken.
#
# Auth:
# Public, but it needs a valid refreshToken in the body.
#
# Important:
# After running this request, the old access token from "04 - Login as owner"
# is replaced for this session. Use ownerRefresh.response.body.$.accessToken
# after this point.
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refreshToken": "{{ownerLogin.response.body.$.tokens.refreshToken}}"
}


### 16 - Get current user with refreshed token
# What it does:
# Same as "05 - Get current logged-in user", but uses the refreshed accessToken.
GET {{baseUrl}}/auth/me
Authorization: Bearer {{ownerRefresh.response.body.$.accessToken}}


### 17A - Logout owner session without refresh
# What it does:
# Revokes the owner session using the original login access token.
#
# Auth:
# Protected.
#
# Important:
# Use this request only if you did NOT run "15 - Refresh owner tokens".
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 17B - Logout owner session after refresh
# What it does:
# Revokes the owner session using the refreshed access token.
#
# Auth:
# Protected.
#
# Important:
# Use this request only if you DID run "15 - Refresh owner tokens".
# After logout, protected requests using this session return 401.
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{ownerRefresh.response.body.$.accessToken}}


## Contribution Requests and Applications — backend issues #48–50

# Scope:
# - Active owner sessions only.
# - The Project must be owned and published.
# - ownerId is never sent; the backend derives ownership from the session.
# - Public discovery returns only published Requests whose Applications Close
#   Time is still in the future.
# - Application submission enters PENDING_OWNER_REVIEW immediately.
# - Application state contains no automatic AI decision or contributor quota.

@publishedProjectId = replace-with-published-project-uuid
@contributionRequestId = replace-with-contribution-request-uuid
@applicationId = replace-with-application-uuid


### 18A - Create a private Contribution Request draft
POST {{baseUrl}}/projects/{{publishedProjectId}}/contribution-requests
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}
Idempotency-Key: create-contribution-request-001
Content-Type: application/json

{
  "title": "Build a webhook delivery viewer",
  "description": "Implement the owner-facing viewer and focused tests.",
  "requiredRequirements": [
    { "text": "Deliver tested NestJS endpoints" }
  ],
  "preferredRequirements": [
    { "text": "Document the HTTP contract" }
  ],
  "technologyTags": ["NestJS", "PostgreSQL"],
  "applicationsCloseTime": "2030-03-10T12:00:00.000Z",
  "targetCompletionDate": "2030-03-20",
  "difficulty": "intermediate",
  "reward": 150,
  "rewardCurrency": "USD"
}


### 18B - Inspect a known owned Contribution Request
GET {{baseUrl}}/contribution-requests/{{contributionRequestId}}
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}


### 18C - Update the private draft
PATCH {{baseUrl}}/contribution-requests/{{contributionRequestId}}
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}
Idempotency-Key: update-contribution-request-001
Content-Type: application/json

{
  "title": "Build and document a webhook delivery viewer"
}


### 18D - Terminal, idempotent discard (not deletion)
POST {{baseUrl}}/contribution-requests/{{contributionRequestId}}/discard
Authorization: Bearer {{ownerLogin.response.body.$.tokens.accessToken}}
Idempotency-Key: discard-contribution-request-001
Content-Type: application/json

{
  "reason": "The Project scope changed"
}


### 19A - Discover actionable Contribution Requests
GET {{baseUrl}}/tasks?q=notifications&technologies=React&difficulty=intermediate&hasReward=true


### 19B - Inspect an actionable Contribution Request
GET {{baseUrl}}/tasks/{{contributionRequestId}}


### 19C - Submit an Application directly to the owner
POST {{baseUrl}}/tasks/{{contributionRequestId}}/applications
Authorization: Bearer {{contributorLogin.response.body.$.tokens.accessToken}}
Content-Type: application/json

{
  "contributionApproach": "I will deliver the accessible workflow with focused tests.",
  "proposedDeliveryDurationDays": 7,
  "idempotencyKey": "11111111-1111-4111-8111-111111111111"
}


### 19D - Inspect one actor-authorized Application
GET {{baseUrl}}/applications/{{applicationId}}
Authorization: Bearer {{contributorLogin.response.body.$.tokens.accessToken}}


### 19E - Withdraw a pending Application
POST {{baseUrl}}/applications/{{applicationId}}/withdraw
Authorization: Bearer {{contributorLogin.response.body.$.tokens.accessToken}}
Idempotency-Key: 22222222-2222-4222-8222-222222222222
