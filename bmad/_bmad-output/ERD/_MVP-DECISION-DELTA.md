# ERD — MVP Decision Delta (binding)

> Approved 2026-07-12 (decision log DEC-001…022, `docs/governance/decision-log.md`). This file lists every schema change required by the approved decisions. **Until each entity file is rewritten, this delta supersedes conflicting content in this folder** (source-of-truth.md). Backend owns the Prisma migration work — this is the contract.

## 1. USER — username + role model (DEC-001, DEC-016)

```text
users
+ username             VARCHAR(30)  UNIQUE (case-insensitive via username_normalized)
+ username_normalized  VARCHAR(30)  UNIQUE, NOT NULL
+ username_changed_at  TIMESTAMP    NULLABLE
~ role → primary_role  ENUM owner | contributor | admin   (rename; semantics: ONE active product role for MVP)
```
Rules: 3–30 chars; letters/numbers/hyphens/underscores; no leading/trailing punctuation; reserved words blocked; suggested from GitHub username, user-confirmed at registration; GitHub disconnect/rename never changes it; changes disabled for MVP (or max 1 per 90 days with old-URL redirects). Canonical route `/profile/:platformUsername`.
Future-compatibility: keep the model migratable to a `user_roles (user_id, role, status, activated_at)` table — no MVP implementation, no FK painting into a corner (e.g., don't overload `primary_role` with composite meanings).

## 2. APPLICATION — status machine v2 + expiry (DEC-004, DEC-005, DEC-013)

```text
applications
~ status ENUM →  pending_validation | review_needed | pending_owner_review |
                 blocked_ineligible | validation_failed | accepted |
                 rejected_by_owner | not_selected | expired | withdrawn
   (replaces: pending_validation | eligible | ineligible | accepted | rejected | withdrawn;
    mapping: eligible→pending_owner_review · ineligible→blocked_ineligible · rejected→rejected_by_owner)
+ review_due_at            TIMESTAMP NULLABLE   (set on entering pending_owner_review; +7 days)
+ expires_at               TIMESTAMP NULLABLE
+ expired_at               TIMESTAMP NULLABLE
+ review_reason            TEXT NULLABLE        (review_needed only)
+ review_queue_entered_at  TIMESTAMP NULLABLE
+ reviewed_at              TIMESTAMP NULLABLE
+ reviewed_by              UUID FK→users NULLABLE  (admin/support resolver — never the owner)
+ review_resolution        ENUM approve_eligibility | reject_eligibility, NULLABLE
```
Behavior: on acceptance, all sibling `pending_owner_review` → `not_selected` (+notify). Scheduled job: day-3 owner nudge, day-5 overdue flag, day-7 → `expired` (+notify contributor). `expired`/`not_selected`/`validation_failed` never feed reputation. Only `pending_owner_review` appears in the owner queue.

## 3. CONTRIBUTION_REQUEST — extended lifecycle (§5)

```text
~ status ENUM → draft | published | assigned | in_progress | awaiting_delivery |
                delivery_submitted | completed | cancelled | expired
   (was: draft | published | assigned | completed | cancelled)
```
Note: `in_progress / awaiting_delivery / delivery_submitted` may be persisted or derived from DELIVERY — backend's choice, but the API must expose the composed state per the approved machine. `expired` = deadline passed unassigned. Reopen after cancel = explicit owner action.
Public route `/projects/:projectSlug` → **resolved by DEC-025**: PROJECT gains a platform-owned slug (see §10a).

## 4. DELIVERY — status machine v2 (§5)

```text
~ status ENUM → not_started | submitted | changes_requested | resubmitted | approved | rejected
   (was: submitted | under_review | approved | rejected | revision_requested;
    mapping: revision_requested→changes_requested · under_review dropped — review is an owner action, not a stored phase; not_started covers accepted-without-delivery)
```
Rules unchanged: approval requires rating 1–5; only approved deliveries create reputation events; prefer changes_requested before rejection.

## 5. TASK_INVITATION — new entity (DEC-003)

See `TASK_INVITATION.md`.

## 6. PASSWORD_RESET_TOKEN — new entity (DEC-012)

See `PASSWORD_RESET_TOKEN.md`.

## 7. USAGE_TRACKER — quota event semantics (DEC-006)

```text
~ action_type ENUM → order_created | application_validation_started
   (replaces application_submitted — too ambiguous)
+ idempotency support: unique validation-attempt key per (contributor, task, submission)
```
Consume on validation start; auto-refund on qualifying technical failure (validation never meaningfully started); `review_needed` keeps the attempt reserved until resolved.

## 8. INGESTION progress (DEC-015)

`GITHUB_ACCOUNT.ingestion_status` (4 values) remains valid as fallback. Detailed contract adds a stage field (13-stage enum, see `docs/design/api-contract-additions.md`) — either extend GITHUB_ACCOUNT or add an `ingestion_runs` table (backend's choice; API contract is what's binding).

## 9. Derived contributor eligibility (DEC-002)

`contributor_eligibility_status` (PENDING_PROFILE_REVIEW · VERIFIED · PROFILE_REJECTED · REANALYSIS_IN_PROGRESS · SUSPENDED) — computed for authorization + serialization; persist only if the backend prefers materialization. Only approved skills feed eligibility/matching, ever.

## 10a. PROJECT — platform-owned slug (DEC-025, resolves OQ-R5)

```text
projects
+ slug                 VARCHAR(80)  NOT NULL (after backfill)
+ slug_normalized      VARCHAR(80)  NOT NULL, UNIQUE INDEX projects_slug_normalized_unique
+ slug_generated_from  VARCHAR      NULLABLE   (optional for MVP)
+ slug_updated_at      TIMESTAMP    NULLABLE   (optional for MVP)
```
Rules: lowercase kebab-case (letters, numbers, hyphens; no repeated/leading/trailing hyphens); ≤80 chars; case-insensitively unique; generated at create/import from title or GitHub repo name; collision → short deterministic/random suffix (`share-k-7f3a`); uniqueness validated before publication; **immutable after publication** (title edits never change the URL — no redirect history needed in MVP). Lookup: `GET /projects/:slug` queries `slug_normalized`. Migration: generate for existing rows → resolve collisions → unique index → then NOT NULL. Database ids are never the canonical public URL.

## 10b. SUBSCRIPTION — entitlements without payments (DEC-026)

```text
subscriptions
+ source ENUM default | admin | demo | payment_provider   (MVP uses default/admin/demo; payment_provider reserved)
```
MVP: plan records + limits + entitlements (matching, notifications, guidance) enforced fully; plans assigned by admin or seeded for demo. **No** checkout, webhooks, refunds, invoices, recurring-billing sync, failed-payment handling, or commission settlement. Post-MVP: payments land behind a `PaymentProvider` interface (createCheckoutSession, cancelSubscription, handleWebhook, getSubscriptionStatus); provider undecided.

## 10c. Public serialization boundary (DEC-007)

Public payloads may include: display name, platform username, bio, **approved** skills, aggregate rating, completed public contributions, success rate, public GitHub link, public contribution history.
Never public: email, OAuth identifiers/tokens, pending/rejected skills, disputes, internal confidence diagnostics, private repos/evidence, application history, admin notes.
