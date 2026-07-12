# Share-k — Implementation Impact Analysis (approved MVP decisions)

> Companion to `docs/governance/decision-log.md`. For each decision cluster: affected entities, modules, migrations, API changes, frontend impact, authorization, background jobs, notifications, test scenarios, post-MVP notes. Backend module names follow the locked MVP list (DEC-017): `auth, users, github, skills, admin-review, projects, contribution-requests, applications, deliveries, reviews, reputation, subscriptions, matching, notifications, reports-disputes, ai-integration`.
> **Repo boundaries**: backend work happens in `sharek-backend` (backend agents); this repo owns the frontend tasks (FE-*) and documentation. No production frontend code was changed in this pass — FE tasks below are the queue, to be implemented per the Spec Kit workflow.
>
> **Frontend safe scope (DEC-028)**: while `001-contributor-profile-redirect` has uncommitted working-tree changes, the only permitted frontend work is documentation-only changes, **FE-1**, and **FE-6**. **FE-3 is blocked** until that feature is committed, merged, or explicitly handed over. Approved local ports (DEC-023): frontend **3001**, backend 4000, Postgres 5432, Redis 6379; env examples use `FRONTEND_URL=http://localhost:3001`, `BACKEND_URL=http://localhost:4000` (unprefixed, DEC-024).

## The 15 backend blockers (§6 — locked prerequisites)

username · single-role-with-future-compat · public read · persisted REVIEW_NEEDED · NOT_SELECTED ≠ REJECTED_BY_OWNER · 7-day expiry · quota-on-validation-start · quota refunds · task invitations · backend fit hints · 48h SLA · port 4000 · post-MVP module fence · master-brief superseded ✅(done) · forgot-password endpoints.

---

## 1. Identity & username (DEC-001, DEC-016)

- **Entities**: USER (`username`, `username_normalized`, `username_changed_at`; `role`→`primary_role`); future `user_roles` compatibility.
- **Modules**: auth, users.
- **Migration**: add columns + case-insensitive unique index; backfill strategy for existing users (suggest from GitHub username, else derived placeholder + forced confirmation on next login — backend to choose; document in migration notes).
- **API**: register gains `username`; `GET /auth/username-availability`; profile routes keyed by platform username.
- **Frontend (FE-1)**: register form — username field with availability check + role cards + DEC-001 copy; auth types add `username`. **✅ Implemented (2026-07-12) against a mock** (`src/modules/auth/services/username-availability.service.ts`, spec `specs/002-register-username-roles/spec.md`) — no real network call yet. Cutover: replace the mock's internals with the real `GET /auth/username-availability` call and send `username` on the real `POST /auth/register`; add the `EMAIL_TAKEN`/`USERNAME_TAKEN` conflict codes from `api-contract-additions.md` §2 to remove the message-text heuristic in `register-form.tsx`. No other file needs to change (query hook and components are already wired to the mock's exact contract shape).
- **AuthZ**: role restrictions enforced server-side (owners can't apply; contributors can't publish); frontend nav is UX only.
- **Tests**: username validation matrix (length, charset, reserved, case-collision), role restriction 403s, availability endpoint rate limiting.
- **Post-MVP**: `user_roles` table, role switching, username change with redirects.

## 2. Eligibility & rejected profiles (DEC-002)

- **Entities**: derived `contributor_eligibility_status`.
- **Modules**: skills, admin-review, applications, matching.
- **API**: `/me` or profile payloads expose eligibility status; matching and application submission check it.
- **Frontend (FE-2)**: rejected-profile experience — browse allowed, apply gated with reason, dispute + re-analyze CTAs (WF-07 states).
- **Tests**: rejected-profile user can browse/dispute/re-analyze but gets 403 on apply and is absent from match results.

## 3. Public read surface (DEC-007)

- **Modules**: projects, contribution-requests, users/reputation — public serializers; auth middleware allows anonymous GET on the four routes.
- **API**: public vs. authenticated payload variants (fit hints & detailed AI reasoning auth-only); never-public field list enforced in serializers, not in the frontend.
- **Frontend (FE-3)**: move `/profile/$username` out of the auth-gated layout; public shells for explore/project/task routes; logged-out CTAs. Touches the active contributor-profile Spec Kit feature — coordinate before implementing.
- **Tests**: serializer snapshot tests asserting the never-public list stays absent; anonymous 200s on the four routes; anonymous 401 on actions.
- **Note**: `:projectSlug` **decided (DEC-025)** — PROJECT gains `slug`/`slug_normalized` (ERD delta §10a): generation from title/repo name, collision suffix, unique index, backfill-then-NOT-NULL migration, immutable after publication. Backend tests: slug lookup by normalized value, uniqueness/collision suffixing, immutability after publish, draft-time generation + pre-publication validation.

## 4. Application machine v2 (DEC-004, DEC-005, DEC-006, DEC-013)

- **Entities**: APPLICATION (new enum + expiry/review fields), USAGE_TRACKER (`application_validation_started`, idempotency), AI_VALIDATION_RESULT (unchanged).
- **Modules**: applications, admin-review, subscriptions (quota), notifications.
- **Migration**: enum replacement with data mapping (eligible→pending_owner_review etc.); new columns; usage-tracker action-type migration.
- **API**: see api-contract-additions §5 (submit with idempotency key, quota endpoint, owner queue = PENDING_OWNER_REVIEW only, accept cascades NOT_SELECTED, admin review-needed queue + resolve).
- **Background jobs**: application-expiry scheduler (day-3 nudge → day-5 overdue flag → day-7 expire+notify); quota refund on VALIDATION_FAILED (idempotent).
- **Notifications**: `application_status` on every transition; day-3 owner nudge; expiry notice to contributor.
- **Frontend (FE-4)**: applications module consumes v2 statuses from day one (status chips per state-model v2); quota copy at submit; NOT_SELECTED and EXPIRED reassurance copy; owner queue with aging/overdue indicators.
- **Tests**: full state-machine transition table (legal/illegal transitions); acceptance cascade (N siblings → NOT_SELECTED, N notifications); expiry job idempotence and timezone handling; quota consume/refund/idempotency under concurrent submits; REVIEW_NEEDED reserve-until-resolved; reputation untouched by NOT_SELECTED/EXPIRED/VALIDATION_FAILED.

## 5. Invitations (DEC-003)

- **Entities**: TASK_INVITATION (new).
- **Modules**: matching, contribution-requests, notifications, subscriptions (plan gating).
- **API**: api-contract-additions §6.
- **Frontend (FE-5)**: Invite action on Matches tab (WF-06); contributor invitations surface (dashboard/notifications); decline action.
- **AuthZ**: Silver/Gold owners only; invite only contributors present in that request's match results.
- **Tests**: plan gating; uniqueness per (request, contributor); expiry on request close; invited contributor still passes through validation + quota; no reputation effects.
- **Post-MVP**: chat/negotiation explicitly excluded.

## 6. Forgot password (DEC-012)

- **Entities**: PASSWORD_RESET_TOKEN (new).
- **Modules**: auth.
- **API**: api-contract-additions §1.
- **Frontend (FE-6)**: wire the existing `/forgot-password` route to real endpoints; add reset form (token from email link); non-enumerating success copy; post-reset redirect to login.
- **Security tests**: non-enumeration (identical responses), single-use, TTL expiry, rate limits, session invalidation after reset, token-hash-only storage.

## 7. Fit hints (DEC-010)

- **Modules**: applications or skills (backend owner to decide), ai-integration for alias normalization.
- **API**: api-contract-additions §4; embeddable in task list/detail payloads.
- **Frontend (FE-7)**: fit panel + coverage buckets + mandatory disclaimer (WF-03/04/05); hide for anonymous/owner.
- **Tests**: approved-skills-only inputs; alias normalization; cache invalidation on profile version bump; contract test that no percentage field exists.

## 8. Ingestion progress (DEC-015)

- **Modules**: github, skills, ai-integration.
- **API**: `GET /ingestions/:id`; 13 stages with 4-state fallback.
- **Frontend (FE-8)**: polling hook (2–3s, stop on terminal), staged progress UI (WF-08), graceful degradation when `stage/progress` null.
- **Tests**: polling stop conditions; fallback rendering; FAILED error surface with retry.

## 9. Admin SLA metrics (DEC-011)

- **Modules**: admin-review.
- **API**: api-contract-additions §8.
- **Frontend (FE-9)**: admin dashboard metric cards + aging bands in queues (WF-11).
- **Tests**: band boundary math (24/48/72h); median calculation.

## 10. Subscriptions & entitlements without payments (DEC-026)

- **Entities**: SUBSCRIPTION (`source` enum), USAGE_TRACKER (existing limits).
- **Modules**: subscriptions, admin.
- **API**: `GET /me/subscription` (plan + entitlements + usage), `PATCH /admin/users/:id/subscription`; no checkout/webhooks/billing.
- **Frontend (FE-10)**: pricing + settings-subscription surfaces show entitlements and usage; upgrade action disabled with copy "Plan purchasing is not available during the MVP preview."; admin users drawer gains plan assignment.
- **Seeding**: demo subscriptions (`source: DEMO`) for the capstone scenario script (sprint 8).
- **Tests**: entitlement gating per tier (orders/month, apps/day, matching top-N, guidance Gold-only); admin assignment audit; plan change mid-period applies new limits without corrupting history.
- **Post-MVP**: `PaymentProvider` interface; provider undecided.

## 11. Governance & docs (DEC-017…020, DEC-023…028) — ✅ done in this repo

Decision log (both batches), source-of-truth (Figma placeholder per DEC-027), conflict register (CR-01…07 all resolved), master-brief superseded, ERD delta + banners (incl. slug §10a, subscription source §10b), port/prefix docs aligned (frontend 3001, backend 4000, unprefixed routes), post-MVP module label in docs/ARCHITECTURE.md. Recommended follow-up **DOC-CHECK-1**: add a CI docs check greping for `localhost:3000`-as-backend / `4000/api` patterns to prevent port/base-path drift (safe next action #10).

---

## Frontend task queue (this repo, in dependency order)

| ID | Task | Depends on backend |
|---|---|---|
| FE-DOC-1 | Label post-MVP modules in docs/ARCHITECTURE.md | — |
| FE-1 | Register: username field + availability + role cards + DEC-001 copy | ✅ UI built against mock; real endpoints still needed for cutover |
| FE-6 | Forgot/reset password wiring | DEC-012 endpoints |
| FE-3 | Public read: profile route out of auth layout; public explore/project/task shells | public serializers |
| FE-8 | Ingestion progress polling + onboarding stepper | `GET /ingestions/:id` |
| FE-2 | Rejected-profile eligibility states on /skills | eligibility status in payloads |
| FE-7 | Fit hint panel | fit-hint endpoint |
| FE-4 | Applications module (v2 statuses, quota copy, aging) | application machine v2 |
| FE-5 | Invitations UI | TASK_INVITATION endpoints |
| FE-9 | Admin SLA dashboard | metrics endpoint |
| FE-10 | Pricing/subscription entitlement surfaces (no-checkout copy per DEC-026) | `GET /me/subscription` |
| FE-11 | Social auth (Google/GitHub) — start/redirect/callback + demo mode | ✅ Built + integrated (2026-07-12); blocked on OAuth callback redirect config (handoff ask #1) |
| FE-12 | Register email-OTP verification step | ✅ Built + contract verified against live backend (2026-07-12); backend SMTP-failure bug reported (ask #2) |
| FE-13 | Profile completion workflow (bio editor · generate skills · connect GitHub) + progress meter | ✅ Built (2026-07-12); bio + skills against mocks — needs `PATCH /contributors/profiles/me` (ask #3) and `POST /skill-profiles/me/generate` (ask #4); GitHub connect uses real endpoints |

Each FE task goes through the Spec Kit flow (constitution gates) before implementation. **Currently unblocked (DEC-028): FE-DOC-1 ✅done, FE-1, FE-6.** FE-3 is blocked until `001-contributor-profile-redirect` is committed/merged/handed over; the remaining tasks additionally wait on their backend dependencies.

## Test strategy summary (§7.17)

- **Unit**: state machines (application, delivery, invitation, profile), username/slug validation, quota math, fit-hint intersection + aliases, band calculations.
- **Integration**: acceptance cascade, expiry job, quota consume/refund idempotency, review-needed resolution, public/private serialization.
- **Contract**: DTO shape checks for every endpoint in api-contract-additions (extend the existing sprint-2 contract-check approach).
- **E2E** (extends TASK-7-02 list): apply→validate→accept→siblings-NOT_SELECTED; apply→technical-failure→refund→retry; 7-day expiry; invite→apply-normally; forgot-password full loop; anonymous public browsing; rejected-profile restrictions.
