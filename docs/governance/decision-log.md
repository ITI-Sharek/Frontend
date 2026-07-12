# Share-k — Product Decision Log

> Every entry is an approved, binding decision. Newer entries supersede older ones only when they say so explicitly. Referenced by `source-of-truth.md` (rank 1).

## 2026-07-12 — MVP open-question resolutions (batch approval)

Approved by: product owner (Karim). Source: "Approved MVP Decisions for Open Questions" brief. Full detail lives in the brief; this log records the binding summary + where each decision is reflected.

| ID | Decision | Reflected in |
|---|---|---|
| DEC-001 (OQ-P1) | One active `primary_role` per account (OWNER/CONTRIBUTOR/ADMIN) for MVP; account model stays future-multi-role-compatible; registration copy: "Choose how you want to use Share-k initially. Additional roles may be supported later." Backend enforces role restrictions; frontend nav is never the authorization mechanism | ERD `USER.md`, IA/register copy, implementation-impact §1 |
| DEC-002 (OQ-P2) | Fully-rejected profile = eligibility restriction, not auth restriction. May browse, view reasons, re-analyze, dispute, edit profile; may not apply / be matched / appear verified. Derived `contributor_eligibility_status` (PENDING_PROFILE_REVIEW, VERIFIED, PROFILE_REJECTED, REANALYSIS_IN_PROGRESS, SUSPENDED) | state-model §1, ERD delta |
| DEC-003 (OQ-P3) | Lightweight `task_invitations` entity (SENT/VIEWED/DECLINED/EXPIRED; source MANUAL_MATCH / GOLD_AUTO_MATCH). Invitation ≠ assignment; never bypasses validation or quota. Copy: "Your verified skills appear to match…", never "You have been selected." | ERD `TASK_INVITATION.md`, api-contract-additions, WF-06 |
| DEC-004 (OQ-P4) | Owner-pending applications auto-expire after 7 days (or when request closes). Day 3 owner nudge, day 5 overdue, day 7 `EXPIRED` + contributor notified. No reputation harm; not owner rejection; not restorable; reapplying consumes new quota. Fields: `review_due_at`, `expires_at`, `expired_at` | state-model §3, ERD `APPLICATION.md`, scheduled job in impact doc |
| DEC-005 (OQ-P5) | On acceptance: other `PENDING_OWNER_REVIEW` applications → `NOT_SELECTED` (distinct from `REJECTED_BY_OWNER`), all notified, request closes to new applications. Copy: "Another contributor was selected… does not affect your eligibility status or reputation." | state-model §3, ERD `APPLICATION.md` |
| DEC-006 (OQ-P6) | Quota consumed when AI validation **starts** (`APPLICATION_VALIDATION_STARTED` usage event); refund on qualifying technical failure; idempotency keys; `REVIEW_NEEDED` keeps the attempt reserved. UI copy: "Submitting this application uses 1 of your daily application attempts, even if the eligibility check does not pass." | ERD `USAGE_TRACKER.md`, WF-05, api-contract-additions |
| DEC-007 (OQ-P7/D2/C3) | Public unauthenticated read: `/explore`, `/projects/:projectSlug`, `/tasks/:taskId`, `/profile/:username` (approved data only). Auth required for actions, private evidence, detailed AI reasoning. Public/private field lists locked (see brief §OQ-P7) | IA, navigation-model, api-contract-additions (serializers) |
| DEC-008 (OQ-D1) | Visual direction: **Registry**, with bilingual copy limited to brand moments (hero, banners, selected empty states) — normal UI single-language | visual-directions.md (status header) |
| DEC-009 (OQ-D3) | No `/inbox` route in MVP; owner dashboard section "Needs your decision" (applications aging, deliveries, reports/disputes) | navigation-model, WF-09 |
| DEC-010 (OQ-D4/T5) | Fit hints approved; **computed on backend**, deterministic, approved-skills ∩ required-technologies; coverage buckets (STRONG/PARTIAL/LOW/UNKNOWN); mandatory disclaimer; no percentages; null for public/owner responses | api-contract-additions §fit-hint, WF-03/04/05 |
| DEC-011 (OQ-D5) | Skill-review SLA target 48h (not a guarantee). Aging: <24h normal · 24–48 due soon · 48–72 overdue · >72 critical. Admin metrics: pending_count, oldest_pending_age, reviewed_today, median_review_time, overdue_count. Contributor copy: "Most profile reviews are completed within 48 hours." | admin screens, state-model, WF-11 |
| DEC-012 (OQ-T1) | Implement forgot/reset password backend (`POST /auth/forgot-password`, `POST /auth/reset-password`) with non-enumerating responses, hashed single-use 15–30min tokens, rate limiting, audit event, session invalidation | api-contract-additions §auth |
| DEC-013 (OQ-T2) | `REVIEW_NEEDED` is a persisted application status. Resolver: admin/support (never the owner). Resolution → `PENDING_OWNER_REVIEW` or `BLOCKED_INELIGIBLE`. Also adds `VALIDATION_FAILED` technical status. Fields: review_reason, review_queue_entered_at, reviewed_at, reviewed_by, review_resolution | state-model §3, ERD `APPLICATION.md` |
| DEC-014 (OQ-T3) | Controlled Arabic glossary adopted (contributor=مساهم, delivery=تسليم العمل, etc.); tech terms untranslated; one term per concept everywhere | `docs/design/arabic-glossary.md` |
| DEC-015 (OQ-T4) | Ingestion progress contract: `GET /ingestions/:id` polled every 2–3s, 13-stage enum with 4-state graceful fallback; no WebSockets for MVP | api-contract-additions §ingestion |
| DEC-016 (OQ-T6/C2) | Platform-owned username is canonical (`users.username`, normalized, 3–30 chars, case-insensitive unique, reserved words blocked, suggested from GitHub, user-confirmed; changes disabled for MVP or max 1/90 days). GitHub username = external metadata only. Route: `/profile/:platformUsername` | ERD `USER.md`, api-contract-additions |
| DEC-017 (C1) | Chat, kanban, discussions, standalone roadmaps, general socket client, PM workspace = post-MVP. MVP backend module list locked (see brief §C1). Gold *generated learning roadmap* allowed as AI guidance content | conflict-register, `docs/ARCHITECTURE.md` note (task) |
| DEC-018 (C4) | `docs/design/master-brief.md` marked Superseded (kept for history) | notice added at top of file |
| DEC-019 (C5) | Standard local ports: frontend 3000 · backend 4000 · Postgres 5432 · Redis 6379. All docs/examples aligned to backend 4000 | docs/API.md, README, conflict-register (note: frontend currently runs 3001 — see CR-05 follow-up) |
| DEC-020 (C6) | Source-of-truth hierarchy adopted (decision log > PRD > Jira > UX brief/wireframes > API contract > local backlog export > historical docs). Jira wins for task status/sprint scope, not product policy. Figma statuses DRAFT/READY_FOR_REVIEW/APPROVED/SUPERSEDED; canonical Figma URL to be added to repo (pending — team) | `source-of-truth.md` |
| DEC-021 (§5) | Approved state machines for contributor profile, contribution request, application, delivery, invitation — canonical version in `docs/design/state-model.md` v2 | state-model.md |
| DEC-022 (§6) | The 15 "backend blockers" are locked prerequisites for backend implementation | implementation-impact.md §blockers |

### Supersessions
- `docs/design/master-brief.md` → superseded by the current UX phase brief + this decision batch (DEC-018).
- `docs/design/state-model.md` v1 (2026-07-12, ERD-only enums) → superseded by v2 (approved states, DEC-021).
- `docs/design/open-questions.md` → all P/D/T/C items resolved by DEC-001…020; remaining genuinely-open items listed at its end (payment provider — PRD OQ-002; Figma canonical URL; frontend dev-port 3001 vs. 3000 standard).

---

## 2026-07-12 — Repository-level decisions (batch 2)

Approved by: product owner (Karim). Source: "Additional Repository-Level Decisions" brief. Resolves the batch-1 residuals (OQ-R1/R2/R5), payment scope (PRD OQ-002), and the Figma source-of-truth entry.

| ID | Decision | Reflected in |
|---|---|---|
| DEC-023 (OQ-R1) | **Frontend dev port stays 3001** (deliberate repo decision, commit 0ec5bbb, not overridden by generic convention). Approved local ports: frontend 3001 · backend 4000 · Postgres 5432 · Redis 6379. Env examples: `FRONTEND_URL=http://localhost:3001`, `BACKEND_URL=http://localhost:4000`. **Supersedes the "frontend 3000" row of DEC-019.** Backend-side alignment (CORS, OAuth callbacks, Docker Compose) is backend-repo work | docs/API.md banner, conflict-register CR-05, implementation-impact |
| DEC-024 (OQ-R2) | **Backend routes stay unprefixed** for MVP: canonical `API_BASE_URL=http://localhost:4000`; `/api` prefix requires a future explicit architecture decision with OpenAPI/frontend/OAuth/contract-test updates and possible dual-route transition — never introduced silently. **Supersedes DEC-019's `…/api` env example** | api-contract-additions header, conflict-register CR-07 |
| DEC-025 (OQ-R5) | **Platform-owned project slug**: `projects.slug` (+ `slug_normalized` mandatory uniqueness; `slug_generated_from`, `slug_updated_at` optional). Public route `/projects/:projectSlug`; DB ids never the canonical public URL. Lowercase kebab-case, letters/numbers/hyphens, ≤80 chars, collision suffix (e.g. `share-k-7f3a`); generated at create/import from title or repo name; uniqueness validated before publication; **immutable after publication** (title changes don't change the URL); backfill + unique index `projects_slug_normalized_unique` before NOT NULL | ERD delta §11, PROJECT.md banner, api-contract-additions §7 |
| DEC-026 (PRD OQ-002) | **No real payment provider in MVP** (unless demo explicitly requires it). Entitlements are independent of payment processing: plan records, owner/contributor limits, matching/notification/guidance entitlements, **admin-controlled plan assignment**, seeded demo subscriptions. `subscription_source: DEFAULT | ADMIN | DEMO` for MVP (`PAYMENT_PROVIDER` reserved). No checkout/webhooks/refunds/invoices/recurring billing/failed-payment/commission settlement. Copy: "Plan purchasing is not available during the MVP preview." or a disabled upgrade action clearly marked as coming later — never a functional-looking purchase CTA. Post-MVP: `PaymentProvider` interface (createCheckoutSession, cancelSubscription, handleWebhook, getSubscriptionStatus); provider undecided | ERD delta §12, SUBSCRIPTION.md banner, pricing/settings screen entries |
| DEC-027 (OQ-R4) | **Figma source-of-truth entry stays explicitly unresolved** — placeholder block in source-of-truth.md ("Pending human confirmation"); no URL invented; a local `.fig` filename without an accessible canonical URL is never the active source of truth; no screen is Figma-approved until URL + approved page/section + approver + date are recorded | source-of-truth.md §Figma |
| DEC-028 (scope) | **Frontend work-scope rule**: while `001-contributor-profile-redirect` has uncommitted working-tree changes, production frontend code is frozen except documentation-only changes, **FE-1**, and **FE-6** (both via Spec Kit). **FE-3 blocked** until the feature is committed, merged, or explicitly handed over. Backend implementation stays in `sharek-backend` | implementation-impact §safe scope |

### Supersessions (batch 2)
- DEC-019 partially superseded: frontend port row (3000 → **3001**, DEC-023) and the `API_BASE_URL=…/api` env example (→ unprefixed, DEC-024). The backend-4000/Postgres/Redis rows stand.
- open-questions.md residuals OQ-R1/R2/R3/R4/R5 → all resolved by this batch.
