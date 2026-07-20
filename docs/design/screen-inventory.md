# Share-k — Screen Inventory (Step 6)

> **Contributor readiness correction (DEC-030–DEC-035, 2026-07-20):** contributor screen descriptions are design intent, not proof of backend readiness. AI fit is advisory; contributor quotas and Gold restrictions are superseded; evidence is source-agnostic and audience-filtered. Use `contributor-implementation-readiness.md` before implementing any contributor screen.

> Grouped by feature. Format per screen: role · journey (see `user-journeys.md`) · purpose → primary CTA · content & components · states · mobile/RTL notes · priority (**MVP** / Secondary / Future).
> Shared component names anticipate `src/shared/components/*`; feature components live in their owning module (constitution).

---

## 1. Marketing & public

### 1.1 Home (`/`)
- Visitor · pre-CJ-1/OJ-1 · Convince & route → **Get started** (split: contribute / own a project)
- Content: hero (verifiable-experience value prop), how-it-works pipeline visual (connect → analyze → review → verified → contribute), AI-transparency block (human review as trust feature), featured published projects (real data or labeled samples), tier teaser, role-split final CTA, footer
- Components: `MarketingNav`, `HeroSection`, `ProcessPipeline`, `ProjectCard` (compact), `TierTeaser`, `Footer`
- States: default; authenticated variant (header → dashboard)
- Mobile: pipeline goes vertical; hero visual simplifies. RTL: full mirror; pipeline direction flips
- **MVP**

### 1.2 Explore projects (`/explore`)
- Visitor + contributor · CJ-2 · Find a matching project → **open project**
- Content: search (semantic), filter panel (tech / category / difficulty), sort, project card grid (title, description, tech tags, languages bar, difficulty, stats, open-task count), pagination or infinite list
- Components: `SearchInput`, `FilterPanel`, `ProjectCard`, `EmptyState`, `SkeletonGrid`
- States: loading, results, empty, filtered-empty (reset CTA), error, unauthenticated (no fit hints)
- Mobile: filters in bottom sheet; single-column cards. RTL: filter sidebar flips side; tags wrap RTL
- **MVP**

### 1.3 Project details (`/projects/$projectId`)
- Visitor + contributor · CJ-2 · Evaluate project → **view open tasks**
- Content: header (title, owner, repo link, stats, status), overview (description/README digest), languages %, tech tags, category/difficulty, open contribution tasks list (with per-task fit hint when authed), owner card
- Components: `ProjectHeader`, `TechTagList`, `LanguageBar`, `TaskCard`, `OwnerCard`, `FitHint`
- States: loading, found, not-found, archived banner, unauthenticated
- Mobile: sticky "View tasks (3)" bottom bar. RTL: stats row mirrors; repo names stay LTR mono
- **MVP**

### 1.4 Pricing (`/pricing`)
- All · pre-registration + upgrades · Understand tiers → **choose plan**
- Content: role toggle (contributor / owner), 3-tier comparison with exact limits (FR-073–082), FAQ (commission, limits reset)
- States: anonymous; authenticated (current plan badge); upgrade disabled with DEC-026 copy: "Plan purchasing is not available during the MVP preview."
- Mobile: tiers stack, current/recommended first. RTL: comparison table mirrors
- **MVP**

### 1.5 Register (`/register`) — [Existing, redesign]
- Visitor · CJ-1/OJ-1 · Create account → **Create account**
- Content: **role choice cards** (outcome-framed; DEC-001 copy: "Choose how you want to use Share-k initially. Additional roles may be supported later."), email/password/name, **platform username with availability check** (DEC-016), language (ar/en)
- States: idle, field errors, EMAIL_TAKEN (→ login link), submitting, success-redirect (→ onboarding)
- Mobile: role cards stack first. RTL: form mirrors, inputs RTL, email/password LTR content
- **MVP**

### 1.6 Login (`/login`) — [Existing, redesign]
- Visitor · re-entry · **Sign in** → role-aware redirect (dashboard / resume onboarding)
- States: idle, invalid credentials (non-enumerating message), submitting, redirect
- **MVP**

### 1.7 Forgot / reset password (`/forgot-password`) — [Existing route; backend **APPROVED — DEC-012**]
- States: request sent (non-enumerating: "If an account exists for this email…"), reset form, invalid/expired token, success (→ login; sessions invalidated)
- **MVP**

### 1.8 Contributor public profile (`/profile/$username`) — [Existing, redesign]
- All · CJ-5 / OJ-3 · Judge verified capability → (owner context: back to application)
- Content: identity header (avatar, name, GitHub link), reputation strip (rating, completed, success rate — FR-067–070), verified skills (approved only; proficiency + evidence expander), reviews received, contribution history, share/report actions; own-view: private fields + edit affordances [Existing]. **Publicly readable without auth (DEC-007)**; username is the platform-owned canonical identifier (DEC-016); public field boundary per api-contract-additions §7
- Components: `ProfileHeader`, `ReputationStrip`, `SkillBadge` (+`EvidencePopover`), `ReviewCard`, `HistoryTimeline`
- States: loading, found, not-found [Existing], own-profile, sparse (new contributor — growth-path empty state, Principle 8)
- Mobile: reputation strip becomes 2×2 grid. RTL: strip mirrors; skill names LTR inside RTL chips
- **MVP** — first high-fidelity candidate (already the active Spec Kit feature)

---

## 2. Onboarding & activation

### 2.1 Contributor onboarding (`/onboarding`, stepper)
- Contributor · CJ-1 · Reach activation → step-specific CTA
- Steps/screens: (a) **GitHub consent** — scope explanation, connect CTA; (b) **Analysis progress** — staged progress (fetching → analyzing → extracting), leave-and-notify; (c) **Profile preview** — generated skills + confidence + evidence, flag-error affordance; (d) **Pending review** — expectation copy, explore-meanwhile link; (e) **Decision** — approved celebration / partial / rejected with next actions
- Components: `Stepper`, `ConsentCard`, `AnalysisProgress`, `SkillPreviewList`, `StatusBanner`
- States: per step — disconnected/connecting/failed; queued/running/failed; generated/empty-result; pending; approved/partial/rejected
- Mobile: full-screen steps. RTL: stepper direction mirrors
- **MVP** — make-or-break flow

### 2.2 Owner onboarding (`/onboarding`, owner variant)
- Owner · OJ-1 · Connect GitHub → import first project (skippable)
- States: connected/failed; repo list loading/empty (no repos → paste `owner/repo` fallback)
- **MVP**

---

## 3. Contributor workspace

### 3.1 Contributor dashboard (`/dashboard`)
- Contributor · hub for all CJ · "What should I do next?" → contextual hero action
- Content: attention feed (status changes, revision requests), profile-status banner (until approved), recommended/matching tasks, reputation snapshot with deltas, quota meter (today's applications)
- Components: `AttentionCard`, `StatusBanner`, `TaskCard` (compact), `ReputationSnapshot`, `QuotaMeter`
- States: onboarding-incomplete (checklist layout), active-empty, active, limit-reached
- Mobile: attention feed first, single column. RTL: meters/deltas mirror
- **MVP**

### 3.2 Task feed (`/tasks`)
- Contributor · CJ-2 · Pick a task → **open task**
- Content: filters (tech, difficulty, reward, deadline), task cards (title, project, required tech, difficulty, deadline, reward, fit hint)
- States: loading, results, empty, filtered-empty, error
- Mobile: filter sheet; cards single column. **MVP**

### 3.3 Task details (`/tasks/$taskId`)
- Contributor · CJ-2→3/4 · Evaluate & apply → **Apply (quota on button)**
- Content: description, **requirements-vs-my-skills panel** (✓ verified / ✗ missing per requirement), difficulty/deadline/reward/max-applicants, project context card, owner link
- Components: `RequirementMatchPanel`, `ApplyButton` (quota-aware), `TaskMeta`, `ApplyModal`
- States: open, already-applied (inline status), assigned/completed/cancelled (read-only), quota-exhausted, profile-not-approved (gate explained), post-submit validating → eligible / ineligible / review_needed
- Mobile: sticky apply bar; match panel collapsible. RTL: ✓/✗ column mirrors
- **MVP** — the most important interaction; second high-fidelity candidate

### 3.4 Apply modal + validation result
- Contributor · CJ-3/4 · Submit → live validation → decision screen (eligible: forwarded-to-owner; ineligible: Principle-5 layout with reason, alternatives, dispute, Gold guidance entry; review_needed: human-review explainer)
- States: composing, submitting, validating (progress), 3 outcomes, validation-error (retry, application preserved)
- **MVP**

### 3.5 My applications (`/applications`)
- Contributor · CJ-3–5 · Track everything → open application
- Content: tabs Active / Needs action / History; rows: task, project, status chip, last update, **next actor**
- States: loading, empty (→ task feed), populated
- Mobile: cards instead of table rows. **MVP**

### 3.6 Application detail (`/applications/$applicationId`)
- Contributor · CJ-3/4/5 · Where does this stand → stage CTA (submit PR / resubmit / read guidance / dispute / withdraw)
- Content: **pipeline visualization** (applied → validated → owner review → delivery → review → done), AI validation card (decision/confidence/justification/matched/missing), delivery panel (PR form or status), owner feedback + rating, gap-guidance panel (Gold, streamed)
- Components: `PipelineTracker`, `ValidationResultCard`, `DeliveryPanel`, `GuidancePanel`, `DisputeModal`
- States: one per pipeline stage + ineligible (±guidance), rejected, revision loop, withdrawn
- Mobile: pipeline horizontal-scroll or vertical. RTL: pipeline flows RTL
- **MVP**

### 3.7 My skills (`/skills`)
- Contributor · CJ-1 tail, re-analysis loop · Understand & improve profile → **Re-analyze** (when meaningful)
- Content: GitHub connection card (status, last synced), skills table (name, proficiency, status chip, confidence, evidence expander, admin adjustment note incl. original level), dispute per skill, re-analysis status
- States: all-pending, mixed, has-rejected, disputed, re-analysis-running, github-disconnected
- Mobile: skill cards. RTL: table mirrors; skill/repo names LTR
- **MVP**

### 3.8 Notifications (`/notifications` + popover)
- All roles · cross-journey · Catch up → open referenced entity
- Content: typed rows (icon per ERD type), day groups, mark-read; popover: latest 5 + view-all
- States: empty, unread, all-read
- **MVP**

### 3.9 Settings (`/settings`, tabs: Account / Language / GitHub / Subscription)
- All roles · maintenance · manage account
- Subscription tab: current plan card, usage meters (apps today / orders this month), benefits list, upgrade CTA
- States per tab: idle/saving/saved/error; GitHub connected/disconnected/syncing; subscription active/expired
- **MVP** (DEC-026: entitlements + usage shown fully; no checkout — upgrade disabled with "Plan purchasing is not available during the MVP preview.")

---

## 4. Owner workspace

### 4.1 Owner dashboard (`/dashboard`)
- Owner · hub · "What needs my review?" → enter queues
- Content: needs-review cards (eligible applications aging, deliveries waiting), per-project pipeline summary, order-quota meter, match digest (Silver/Gold)
- States: no-projects (import hero), no-requests, active, limit-reached
- **MVP**

### 4.2 My projects (`/my-projects`)
- Owner · OJ-1 · Manage portfolio → **Import project**
- Content: project rows/cards (title, status chip draft/published/archived, open requests, pending applications, last activity)
- States: empty (first-import hero), populated
- **MVP**

### 4.3 Import & publish flow (`/my-projects/new`, stepper)
- Owner · OJ-1 · Repo → published project
- Screens: (a) repo picker (list from GitHub + paste fallback, search), (b) metadata review form (fetched-field labels, category+difficulty pickers with matching-impact help text), (c) publish confirm (visibility consequence)
- States: repos loading/empty, importing, import-failed (distinct causes: not-found / private / rate-limit / duplicate-URL), draft-saved, published
- Mobile: usable but desktop-primary. **MVP**

### 4.4 Project management (`/my-projects/$projectId`, tabs Overview / Requests)
- Owner · OJ-1/2 · Operate one project
- Overview: metadata edit, status control (publish/archive with consequences), stats, re-sync
- Requests: request rows with pipeline counts (applications/eligible/accepted/delivered) → **New request** (quota on button)
- States: draft (publish nudge), published, archived (read-only)
- **MVP**

### 4.5 Create contribution request (`.../requests/new`)
- Owner · OJ-2 · Define the task → **Publish request**
- Content: title, description (guidance for good specs), required-tech tag input (calibration help: "over-specifying filters everyone out"), difficulty, deadline, reward+currency, max applicants; quota status
- States: quota-blocked (before entry), draft, publishing, published
- **MVP**

### 4.6 Request management (`.../requests/$requestId`, tabs Applications / Matches / Delivery / Details)
- Owner · OJ-3/4 · The owner's main working surface
- **Applications tab**: transparency line ("12 received · 4 eligible"), applicant cards (identity, reputation strip, matched/missing skills, AI justification + confidence expander, priority flag, cover message) → **Accept / Reject**
- **Matches tab**: Silver/Gold match cards with reasoning; Bronze: locked preview. **Invite action [APPROVED — DEC-003]**: sends `task_invitation` (states SENT/VIEWED/DECLINED/EXPIRED); invitation copy per glossary, never bypasses validation/quota
- **Delivery tab**: PR link, contributor notes, requirements checklist → **Approve (rating 1–5 + feedback) / Request revision / Reject**; approval-consequence confirm
- **Details tab**: edit (until assigned), cancel with impact explanation
- States: per lifecycle — no-applications, reviewing, assigned-waiting, delivery-review, completed, cancelled
- Mobile: tabs → segmented control; applicant cards stack. RTL: full mirror
- **MVP** — third high-fidelity candidate

---

## 5. Admin workspace

### 5.1 Admin dashboard (`/admin`)
- Admin · AJ-1/2 · Queue health → enter oldest queue
- Content: queue cards (pending skill reviews, open disputes, open reports) with counts + oldest-waiting ages
- **MVP**

### 5.2 Skill review queue (`/admin/skill-reviews`)
- Admin · AJ-1 · Prioritize reviews → open review
- Content: rows (contributor, skill count, avg confidence, waiting time), oldest-first
- States: empty (queue clear), populated, aging-warning
- **MVP**

### 5.3 Skill review workspace (`/admin/skill-reviews/$userId`)
- Admin · AJ-1 · Decide per skill on evidence → **Finish review**
- Content: three-pane — skills table (approve/adjust/reject per row), evidence panel (summary + source links), contributor context (GitHub, account age, prior reviews); batch approve-remaining; next-in-queue
- Components: `SkillReviewRow`, `EvidencePanel`, `ProficiencyAdjuster`, `QueueNav`
- States: unreviewed, partially-reviewed (resumable), confirming, completed, regenerated-diff
- Mobile: desktop-first; fallback = read + simple per-skill actions. RTL: panes mirror
- **MVP** — fourth high-fidelity candidate

### 5.4 Disputes (`/admin/disputes` + drawer)
- Admin · AJ-2 · Resolve challenges → **Uphold / Overturn / Dismiss** (+ required notes)
- Content: list (type, contributor, age); drawer: contributor's reason/evidence vs. original AI output side-by-side, related history
- **MVP**

### 5.5 Reports (`/admin/reports` + drawer)
- Admin · AJ-2 · Moderate → **Resolve / Dismiss** (+ actions: suspend, archive)
- Content: list (reason enum, target type, age); drawer: polymorphic target preview, reporter context
- **MVP**

### 5.6 Users (`/admin/users`)
- Admin · support · Find & act → role change [Existing endpoint], suspend/reactivate
- Content: search, role/status filters, user drawer (profile, skills, subscription, related reports)
- **MVP** (basic) / advanced Future

---

## 6. Shared overlays

| Overlay | Trigger | Priority |
|---|---|---|
| Apply modal | Task details | MVP |
| Dispute modal (skill / validation) | Skills page, ineligible screen | MVP |
| Report modal (polymorphic) | Profiles, projects, tasks | MVP |
| Confirm dialogs w/ consequence copy (publish, archive, accept, approve+rate, cancel) | Owner/admin actions | MVP |
| Notification popover | Top bar bell | MVP |
| Language switch (instant RTL/LTR) | Nav/avatar menu | MVP |

## Priority recap

- **MVP**: everything above unless marked otherwise — all are required by confirmed journeys.
- **Secondary**: standalone How-It-Works / For-Contributors / For-Owners pages; owner activity tab; guidance library.
- **Future**: saved projects, community, owner public profiles, role switching, admin AI-history & analytics, global omnisearch, chat/kanban/discussion/roadmaps (architecture-doc modules without PRD backing — OQ-C1).
