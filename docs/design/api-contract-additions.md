# Share-k — API Contract Additions (approved MVP decisions)

> ## ⚡ Backend handoff — current asks (2026-07-12, post social-auth integration)
> The frontend is now integrated with the implemented endpoints (register + email OTP, social auth start/callback, GitHub connect, contributor profiles). **These are the items the backend needs to do next, in priority order:**
>
> 1. **OAuth callback redirect configuration (blocks completing social login in the browser).** Keep provider apps + backend env on backend OAuth callback URLs such as `GITHUB_OAUTH_CALLBACK_URL=http://localhost:4000/github/oauth/callback` and `GOOGLE_OAUTH_CALLBACK_URL=http://localhost:4000/auth/google/callback`. Those backend GET callbacks must not leave the browser on raw JSON; after exchanging/validating provider code, redirect to `FRONTEND_URL/auth/callback` with either a full session or enough `code`/`state` for the frontend to call `POST /auth/{provider}/callback`.
> 2. **Register must not fail after creating the user when SMTP fails** (reproduced live: user row created + OTP stored, request still returned "Verification email could not be sent"; retry then hits `EMAIL_TAKEN` and the user is stuck). Fix: in dev without working SMTP, log the OTP (as docs already promise) and return the normal 201; in prod, queue/retry the email async. Also define the **pending-user re-entry** path: attempting to log in as a `pending` user should return a distinguishable code (e.g. `EMAIL_NOT_VERIFIED`) so the frontend can route to the OTP screen + resend.
> 3. **`PATCH /contributors/profiles/me`** `{ "bio"?: string|null, "availability"?: string|null }` → full updated profile DTO with `completionPrompts` recomputed. The profile bio editor is built and working against a mock — edits currently revert on refetch because nothing persists (observed live).
> 4. **`POST /skill-profiles/me/generate`** → `202 { "ingestionId": "…" }` consumable by the DEC-015 ingestion-progress contract (§3 below). The "generate skills" card is built against a mock.
> 5. **Make `role` optional on `GET /auth/{provider}/start`** for pure sign-in (it's only used when creating a new user; the frontend currently must send a default `contributor` on login-intent, which is wrong if a new *owner* signs in via the login page).
> 6. `POST /auth/register`: accept optional `username` (DEC-016) and return distinguishable `EMAIL_TAKEN` / `USERNAME_TAKEN` codes (§2). Frontend field is built + flag-gated, ships the day this lands.
> 7. Forgot/reset password endpoints (§1 — DEC-012) remain unimplemented; the frontend route exists.

> Contract deltas required by DEC-003/004/006/007/010/012/013/015/016 (`docs/governance/decision-log.md`). This documents the **agreed frontend↔backend contract**; `docs/API.md` continues to document only what the backend has implemented. Backend implementation happens in `sharek-backend` (backend-owned).
> Conventions: bearer auth as today; errors use the normalized error envelope; all timestamps ISO-8601 UTC.
> **Base URL (DEC-023/024)**: `API_BASE_URL=http://localhost:4000` — routes are **unprefixed** (`POST /auth/login`, not `/api/auth/login`); a global `/api` prefix requires a future explicit architecture decision, never a silent change. Frontend dev server: `http://localhost:3001`.

---

## 1. Auth — forgot / reset password (DEC-012)

```http
POST /auth/forgot-password          (public, rate-limited by IP + normalized email)
{ "email": "user@example.com" }
→ 202 { "message": "If an account exists for this email, a reset link has been sent." }
   (identical response whether or not the email exists — non-enumeration)

POST /auth/reset-password           (public)
{ "token": "opaque-one-time-token", "newPassword": "new-secure-password" }
→ 200 { "success": true }           side effects: token consumed; other reset tokens revoked;
                                    all sessions invalidated; audit event recorded
→ 400 TOKEN_INVALID_OR_EXPIRED      (single generic failure code)
```
Token: hash-stored, single-use, 15–30 min TTL.

## 2. Registration — username confirmation (DEC-016)

`POST /auth/register` gains required `username` (platform-owned, 3–30 chars, `[A-Za-z0-9_-]`, no leading/trailing punctuation, reserved words blocked, case-insensitive unique).
Support endpoint for the form:
```http
GET /auth/username-availability?username=sara-dev   (public, rate-limited)
→ 200 { "available": true, "suggestion": null }
→ 200 { "available": false, "suggestion": "sara-dev-1" }   // taken
→ 200 { "available": false, "suggestion": null }           // reserved word — no suggestion offered
```
GitHub-connected flows may prefill from the GitHub username; the user always confirms. Username changes: disabled for MVP (`400 USERNAME_CHANGES_DISABLED`).

**Register conflict codes (needed for frontend error routing — not yet implemented on the backend)**: `docs/API.md` already documents `EMAIL_TAKEN` for `POST /auth/register`. Once `username` is added to that endpoint, conflicts MUST be distinguishable the same way:
```http
POST /auth/register
→ 409 { "code": "EMAIL_TAKEN", "message": "..." }
→ 409 { "code": "USERNAME_TAKEN", "message": "..." }
```
A single generic 409/400 without a `code` field forces the frontend to guess from message text (see the interim heuristic in `src/modules/auth/components/register-form.tsx`, marked `TODO(backend)`) — please return `code` so that heuristic can be removed.

**Frontend status (2026-07-12)**: the registration UI (username field with live availability, role-selection disclaimer) is implemented and demoed against a mock in `src/modules/auth/services/username-availability.service.ts`. The username field is currently **flag-gated off** (`REGISTER_USERNAME_FIELD_ENABLED` in `signup.constants.ts`) because the backend's `forbidNonWhitelisted` ValidationPipe rejects unknown register fields — flip the flag when the backend accepts `username`. See `docs/design/implementation-impact.md` FE-1.

**Implemented registration contract (backend live, frontend integrated 2026-07-12)**: `POST /auth/register` creates a `pending` user and returns `{ user, emailVerificationRequired: true, verificationExpiresAt }` — **no tokens**. `POST /auth/verify-email { email, code }` → full auth session; `POST /auth/verify-email/resend { email }`. The frontend register flow shows an OTP step after submit (`verify-email-step.tsx`) with resend + cooldown.

## 2b. Social auth (implemented backend, frontend integrated 2026-07-12)

`GET /auth/{google|github}/start?role=owner|contributor` → `{ provider, role, authorizationUrl, state, expiresAt }`; browser redirects to `authorizationUrl`; provider redirects to the backend OAuth callback URL; backend then redirects browser to `/auth/callback` with a session or code/state. Completion via `POST /auth/{provider}/callback { code, state }` → auth session when the frontend receives code/state. Frontend keeps a sessionStorage pending record across the provider hop and distinguishes social-login from GitHub-account-connection (`POST /github/oauth/callback`) on the shared `/auth/callback` route. **Blocked on the backend GET callback browser redirect behavior — ask #1 above.** A local demo mode (`VITE_SOCIAL_AUTH_DEMO=1`) simulates the provider hop for offline demos.

## 3. Ingestion progress (DEC-015)

```http
GET /ingestions/:id                 (protected, owner-of-ingestion only)
→ 200 {
  "id": "ing_123",
  "status": "PROCESSING",           // QUEUED | PROCESSING | AWAITING_REVIEW | COMPLETED | PARTIALLY_COMPLETED | FAILED
  "stage": "ANALYZING_REPOSITORIES",// nullable; 13-stage enum below
  "progress": 55,                   // 0–100, nullable when unknown — UI must not invent numbers
  "messageKey": "ingestion.analyzingRepositories",
  "processedItems": 8, "totalItems": 14,   // nullable
  "startedAt": "…", "updatedAt": "…",
  "error": null                     // { code, messageKey } on FAILED
}
```
Stages: `QUEUED, FETCHING_GITHUB_PROFILE, FETCHING_REPOSITORIES, FETCHING_REPOSITORY_EVIDENCE, NORMALIZING_DATA, INDEXING_EVIDENCE, ANALYZING_REPOSITORIES, GENERATING_SKILLS, SAVING_PROFILE, AWAITING_ADMIN_REVIEW, COMPLETED, PARTIALLY_COMPLETED, FAILED`.
Frontend: poll 2–3s, stop on terminal (`COMPLETED | PARTIALLY_COMPLETED | FAILED`, and pause on `AWAITING_ADMIN_REVIEW`). Graceful fallback: backend may ship only the 4 coarse statuses first — same shape, `stage`/`progress` null. No WebSockets for this workflow (SSE later only if needed).

## 4. Fit hint (DEC-010)

```http
GET /tasks/:taskId/fit-hint         (protected, contributor role)
→ 200 {
  "fitHint": {
    "available": true,
    "matchedRequiredTechnologies": 2,
    "totalRequiredTechnologies": 3,
    "matched": ["React", "TypeScript"],
    "missing": ["Docker"],
    "coverage": "PARTIAL",          // STRONG (all) | PARTIAL | LOW (0–1) | UNKNOWN
    "basedOnProfileVersion": 4,
    "disclaimerCode": "PRELIMINARY_NOT_FINAL"
  }
}
```
Rules: backend-authoritative; approved skills only; technology aliases normalized server-side; cache key = (profile version, task-requirement version); may also be embedded in authenticated task-list/detail responses. Public responses: `fitHint` omitted/null. Owner responses: omitted. **Never** rendered as a probability or the final eligibility decision — UI shows the disclaimer: "This is an early indication based on your approved skills, not the final AI eligibility decision."
Display buckets: 3/3 "Strong requirement coverage" · 2/3 "Partial requirement coverage" · 0–1/3 "Requirements may not be met" · unknown "Full validation required".

## 5. Applications — status machine v2 (DEC-004/005/006/013)

Application DTO `status` values (breaking change from v1 mapping — see ERD delta §2):
`PENDING_VALIDATION | REVIEW_NEEDED | PENDING_OWNER_REVIEW | BLOCKED_INELIGIBLE | VALIDATION_FAILED | ACCEPTED | REJECTED_BY_OWNER | NOT_SELECTED | EXPIRED | WITHDRAWN`
Plus: `reviewDueAt`, `expiresAt`, `expiredAt` on owner-pending applications.

```http
POST /tasks/:taskId/applications      (protected, contributor, quota-gated)
{ "coverMessage": "…", "idempotencyKey": "uuid" }
→ 201 { application }                 quota consumed when validation starts (DEC-006);
→ 409 ALREADY_APPLIED · 429 DAILY_QUOTA_EXHAUSTED { resetsAt } · 403 PROFILE_NOT_VERIFIED
Pre-submit copy (required): "Submitting this application uses 1 of your daily
application attempts, even if the eligibility check does not pass."

GET  /me/applications?status=…        (contributor)
GET  /me/quota                        (contributor) → { "applicationsToday": 1, "dailyLimit": 2, "resetsAt": "…" }
POST /applications/:id/withdraw       (contributor, pre-acceptance only)

GET  /tasks/:taskId/applications      (owner) → PENDING_OWNER_REVIEW only + transparency
                                      counts { received, passedValidation }
POST /applications/:id/accept         (owner) → siblings auto → NOT_SELECTED (DEC-005)
POST /applications/:id/reject         (owner) { "reason": "…"? } → REJECTED_BY_OWNER

Admin resolution (DEC-013):
GET  /admin/application-reviews       (admin) → REVIEW_NEEDED queue
POST /admin/application-reviews/:id/resolve
{ "resolution": "APPROVE_ELIGIBILITY" | "REJECT_ELIGIBILITY", "notes": "…" }
```
Scheduled behavior (backend job): day-3 owner nudge notification; day-5 `overdue: true` flag in owner queue payloads; day-7 transition → `EXPIRED` + contributor notification. Quota refund on `VALIDATION_FAILED` is automatic and idempotent.

## 6. Invitations (DEC-003)

```http
POST /tasks/:taskId/invitations       (owner, Silver/Gold, from match results)
{ "contributorId": "…" } → 201 { invitation }   409 ALREADY_INVITED · 403 PLAN_NOT_ELIGIBLE
GET  /me/invitations                  (contributor) → active invitations
POST /invitations/:id/decline         (contributor)
```
`source`: `MANUAL_MATCH` | `GOLD_AUTO_MATCH` (auto on publish for Gold). Status: `SENT | VIEWED | DECLINED | EXPIRED` (viewed set on first contributor open). Notification type: `match_found`.

## 7. Public read surface (DEC-007)

Public (no auth): `GET /explore`-backing project list, `GET /projects/:slug`, `GET /tasks/:taskId`, `GET /profiles/:username`.
`:slug` **decided (DEC-025)**: platform-owned project slug, looked up by `slug_normalized`; lowercase kebab-case, ≤80 chars, collision suffix, immutable after publication; database ids never appear in canonical public URLs. Project list/detail DTOs include `slug`.
Public serializers expose only: display name, platform username, bio, approved skills, aggregate rating, completed public contributions, success rate, public GitHub link, public contribution history. Auth-only additions: fit hints, detailed AI eligibility reasoning, private evidence, application actions.
Never serialized publicly: email, OAuth identifiers/tokens, pending/rejected/disputed skills, internal confidence diagnostics, private repos/evidence, application history, admin notes.

## 7b. Subscriptions — entitlements without payments (DEC-026)

```http
GET /me/subscription        (protected) → { "plan": "bronze", "roleContext": "contributor",
                              "source": "DEFAULT", "entitlements": { "dailyApplications": 2, … },
                              "usage": { "applicationsToday": 1 }, "expiresAt": null }
PATCH /admin/users/:id/subscription   (admin) { "plan": "gold", "source": "ADMIN" }
```
No checkout/webhook/billing endpoints in MVP. UI copy where an upgrade would be purchased: **"Plan purchasing is not available during the MVP preview."** or a disabled upgrade action clearly marked as coming later — never a functional-looking purchase CTA.

## 8. Admin SLA metrics (DEC-011)

```http
GET /admin/review-metrics   (admin)
→ { "pendingCount": 7, "oldestPendingAgeHours": 61, "reviewedToday": 12,
    "medianReviewTimeHours": 18, "overdueCount": 2 }
```
Aging bands (UI): <24h normal · 24–48h due-soon · 48–72h overdue · >72h critical.

---

### Breaking-change note for the frontend
Existing modules touched: `contributors` (profile now public-read; username canonical), `auth` (register username field; forgot/reset wired to real endpoints), future `applications`/`tasks` modules must consume the v2 status enum from day one. No frontend code consumes the removed `eligible/ineligible/rejected` application statuses yet — adopting v2 now costs nothing.
