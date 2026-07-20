# Backend Handoff — Sprint 1 close-out (from the client repo)

> **From**: client (`Sharek/client`, TanStack, branch `master` @ `bb8c0c4`)
> **To**: backend agent working in `Sharek/server` (NestJS)
> **Date**: 2026-07-19
> **Supersedes**: the "⚡ Backend handoff — current asks (2026-07-12)" block at the top of `client/docs/design/api-contract-additions.md`. That list is now **partly stale** — §1 below says which asks are already done, verified against `server/src`.
> **Jira**: SK-103 / SK-104 (client, TASK-1-01/02) and the backend-side Sprint 1 items. The Jira board is auth-gated and could not be read directly — issue keys here come from `server/docs/handoffs/sprint-1-external-verification-handoff.md`.

---

## 1 · Asks that are ALREADY DONE — close them, don't re-implement

Verified by reading `server/src`. The client's old ask list still lists these as open; they are not.

| Old ask | Status | Evidence |
|---|---|---|
| #1 OAuth callback must redirect the browser, not return raw JSON | ✅ **Done** | `identity/controllers/github-auth.controller.ts:22-38` and `google-auth.controller.ts:22-38` — `GET callback` redirects to `FRONTEND_URL/auth/callback` with `provider`/`code`/`state`/`error`/`error_description`. `FRONTEND_URL` defaults to `http://localhost:3001` (`shared/config/env.validation.ts:16`). |
| #6 `username` on `POST /auth/register` | ✅ **Done** | `identity/dto/register.request.ts:24` + `validators/username.validator.ts`. Client flag `REGISTER_USERNAME_FIELD_ENABLED` is already flipped to `true`. |
| `GET /auth/username-availability` | ✅ **Done** | `manual-auth.controller.ts:26` |
| #7 forgot / reset password (DEC-012) | ✅ **Done** | `manual-auth.controller.ts:46,51` |
| #4 skill-profile generation endpoint | ✅ **Done, different path** | `skill-profiles.controller.ts:23,35` — it is `POST /skill-profiles/me/generations` + `GET /skill-profiles/me/generations/:generationId`, **not** `/skill-profiles/me/generate` + `/ingestions/:id`. The client already calls the real path (`modules/skill-profiles/services/skill-profile-generation.service.ts:12,22`). **Action for backend: none.** Action for client: correct §3 of `api-contract-additions.md` so nobody re-specs `/ingestions/:id`. |
| #2 (first half) dev SMTP unconfigured must not 500 | ✅ **Done** | `identity/integrations/email-verification.sender.ts:25-36` — logs the OTP in non-production. |

---

## 2 · Open asks, priority order

### P0-1 — Register still strands the user when SMTP is *configured but failing*

`email-verification.sender.ts:49-57` throws `EMAIL_VERIFICATION_SEND_FAILED` (502) **after** the user row and OTP are already committed. The user then cannot retry: the second attempt hits `EMAIL_TAKEN`. The unconfigured-SMTP path was fixed; the failing-transport path was not.

**Asked change**: make verification-email delivery non-fatal to registration. Either
(a) queue the send on BullMQ (Redis is already up) and return the normal `201` immediately, or
(b) catch, log, return `201` with a flag such as `emailDeliveryDeferred: true`, and rely on `POST /auth/verify-email/resend`.

**Acceptance**: with a deliberately broken `SMTP_HOST`, `POST /auth/register` returns `201` with `emailVerificationRequired: true`; the user can complete verification via resend once SMTP recovers; no state where a user exists but can never log in.

### P0-2 — Pending-contributor login is inconsistent (decide, then document)

`identity/services/auth.service.ts:280`:

```ts
if (user.status === 'pending' && user.role !== UserRole.contributor) {
  throw new ApplicationError(..., 'EMAIL_VERIFICATION_REQUIRED', 403);
}
```

Pending **owners** are blocked; pending **contributors** are allowed to log in unverified. The client cannot tell whether that is deliberate. It matters because the client routes on this: an unverified user reaching `/dashboard` instead of the OTP screen is a live bug surface.

**Asked**: confirm the intent. If contributors must also verify, drop the role condition so both roles get `EMAIL_VERIFICATION_REQUIRED` (403) and the client routes to the OTP + resend screen. If the exemption is deliberate, say so in `docs/api-contracts.md` and the client will stop treating pending contributors as a redirect case.

### P0-3 — `PATCH /contributors/profiles/me` + three new columns

Still the single biggest blocker. Only `POST /contributors/profiles/me/ensure` and `GET /contributors/profiles/:username` exist (`contributor-profiles.controller.ts:16,22`), and `ContributorProfile` in `prisma/schema.prisma` has only `bio` and `availability`:

```prisma
model ContributorProfile {
  id            String    @id @default(uuid()) @db.Uuid
  user_id       String    @unique @db.Uuid
  bio           String?
  availability  String?   @db.VarChar(100)
  ...
}
```

The registration "details step" already collects `experienceLevel`, `interests`, and `declaredSkills`, and the profile bio editor is built — all of it currently persists **client-side only** against a mock (`modules/contributors/services/contributor-profile-completion.service.ts`), so edits revert on refetch.

**Asked**:

```prisma
experience_level  String?   @db.VarChar(20)   // junior | mid | senior | expert
interests         String[]                     // web | mobile | ai | design | devops | docs
declared_skills   String[]                     // free text, distinct from AI-verified skills
```

```http
PATCH /contributors/profiles/me            (protected, contributor)
{ "bio"?: string|null, "availability"?: string|null,
  "experienceLevel"?: "junior"|"mid"|"senior"|"expert"|null,
  "interests"?: string[], "declaredSkills"?: string[] }
→ 200 { …full profile DTO, completionPrompts recomputed }
```

`declaredSkills` must stay clearly separate from the AI-verified `skills` list in the DTO — the UI renders "موثقة" vs unverified differently and must never conflate them.

**Acceptance**: set a bio + experienceLevel + 2 interests, refetch `GET /contributors/profiles/:username`, values survive; `completionPrompts` shrinks accordingly.

### P1-4 — Distinguishable register conflict codes

`POST /auth/register` must return `409 { "code": "EMAIL_TAKEN" }` vs `409 { "code": "USERNAME_TAKEN" }`. The client currently guesses from message text — see the `TODO(backend)` heuristic in `src/modules/auth/components/register-form.tsx`. That heuristic gets deleted the day this lands.

### P1-5 — `role` optional on `GET /auth/{provider}/start`

`SocialAuthStartRequest` requires `role`, so the login page must send a default `contributor` for pure sign-in — wrong if an existing **owner** signs in via the login page. Make `role` optional; when absent and the user already exists, use the stored role; when absent and the user is new, either 400 with `ROLE_REQUIRED_FOR_SIGNUP` or park them on a role-selection step.

### P1-6 — Plan / quota endpoint for the app-shell chip

The role-aware sidebar (`src/routes/_appLayout.tsx`) renders hardcoded strings — `"1 من 2 طلبات اليوم"` (contributor) and `"0 من 10 طلبات مساهمة هذا الشهر"` (owner). Nothing reports plan or usage.

Per DEC-026 (entitlements without payments):

```http
GET /me/subscription    (protected)
→ { "plan": "bronze", "roleContext": "contributor", "source": "DEFAULT",
    "entitlements": { "dailyApplications": 2, … },
    "usage": { "applicationsToday": 1 }, "expiresAt": null }
```

Role-aware, so one call serves both chips. No checkout/webhook endpoints in MVP.

---

## 3 · Endpoints the client has fully built against mocks

These are demo-ready UIs with no backend behind them. Each client service carries a JSDoc naming its intended endpoint — the mock **is** the contract proposal, so read the service before designing the DTO.

| Client mock service | Proposed endpoint | Sprint-1 priority |
|---|---|---|
| `modules/contributors/services/onboarding.service.ts` | `GET /contributors/onboarding` (+ generation polling, already exists) | High — first-run journey CJ-1 |
| `modules/dashboard/services/dashboard.service.ts` | `GET /contributors/dashboard` | High |
| `modules/projects/services/explore.service.ts` | `GET /projects/explore` (filter/sort/search server-side) | High |
| `modules/projects/services/project-details.service.ts` | `GET /projects/:slug` (DEC-025 slug, not id) | High |
| `modules/projects/services/my-projects.service.ts` | `GET /me/projects` + import draft flow | Medium |
| `modules/tasks/services/tasks.service.ts` | `GET /tasks`, `GET /tasks/:id`, `POST /tasks/:taskId/applications` | Medium — needs the DEC-004/006/013 status machine from day one |

Full specs for the tasks/applications surface (v2 status enum, quota, idempotency, admin review queue) are in `client/docs/design/api-contract-additions.md` §5. **Adopt the v2 enum from the first commit** — no client code consumes the old `eligible/ineligible/rejected` values, so there is no migration cost now and a large one later.

---

## 4 · Conventions the client depends on

- Base URL `http://localhost:4000`, routes **unprefixed** (`POST /auth/login`, never `/api/auth/login`). A global `/api` prefix is an explicit architecture decision, never a silent change (DEC-023/024).
- Errors use the normalized envelope with a machine-readable `code`. The client routes on `code`, never on `message` text.
- All timestamps ISO-8601 UTC.
- Public read surface (DEC-007) must never serialize: email, OAuth identifiers/tokens, pending or rejected skills, internal confidence diagnostics, private repos/evidence, application history, admin notes.

## 5 · What to return with the completed work

- Endpoints added/changed, with the actual final paths.
- Prisma migration name(s).
- Any DTO field that differs from what this doc proposed, and why — the client codes to the real shape, not the proposal.
- Whether P0-2 (pending-contributor login) was a bug or intentional.
