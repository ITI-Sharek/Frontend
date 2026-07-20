# Share-k — Information Architecture (Step 3)

> **Contributor policy correction (DEC-030–DEC-035, 2026-07-20):** contributor AI fit is advisory, contributor quotas/Gold restrictions are removed, evidence authorization is distinct from linked GitHub identity, and `/applications`, `/applications/:applicationId`, and `/skills` remain proposed IA until contract mapping is complete. Use `contributor-experience-brief.md` and `contributor-implementation-readiness.md` for contributor implementation decisions; conflicting contributor passages below are retained only until the document is fully migrated.

> Labels: **[Confirmed]** PRD/ERD-locked · **[Existing]** implemented in code · **[UX-Required]** addition needed to complete a confirmed journey · **[Future]** post-MVP recommendation.
> Route syntax follows TanStack Router file routes (constitution: routes are composition-only; business logic lives in `src/modules/*`).

## Structural decisions (read first)

1. **Four surfaces, one app**: Public site, Contributor app, Owner app, Admin app share one codebase with three pathless layouts — `_publicLayout` (marketing shell), `_appLayout` (authenticated shell, role-aware), `_adminLayout` (admin shell). This matches the existing architecture plan and `docs/ARCHITECTURE.md`.
2. **`/dashboard` is one route, two compositions.** Contributor and owner dashboards share the path; the route file composes different module components by `user.role`. Rationale: one login → one home; role is a property of the account, not a URL namespace. Admin is a separate `/admin` namespace because its shell, nav, and audience differ entirely.
3. **Discovery is public — APPROVED (DEC-007).** `/explore`, `/projects/$projectId` (slug pending OQ-R5), `/tasks/$taskId`, and `/profile/$username` render without auth; fit hints, apply actions, detailed AI reasoning, and private data appear only when authenticated. Public/private field lists are locked in `api-contract-additions.md` §7.
4. **Applications and active contributions are one area.** An "active contribution" is just an application in `accepted` state with a delivery attached (ERD: APPLICATION 1:1 DELIVERY). Splitting them into two nav items would force users to learn our data model. One page, status tabs.
5. **Saved projects are excluded from MVP.** No SAVED_PROJECT entity exists in the ERD and no FR covers it. **[Future]** — listed in open-questions.md.
6. **Reputation and reviews are profile sections, not pages.** FR-066 defines reputation as part of the public contributor profile. A separate "Reputation" nav item would fragment the profile's story.
7. **Skill-gap guidance lives on the rejected application**, where it is generated (ERD: SKILL_GAP_GUIDANCE → APPLICATION). A standalone guidance library is **[Future]**.
8. **How It Works / For Contributors / For Owners are home-page sections in MVP**, promoted to standalone pages only if content outgrows them. Community pages: **[Future]** (no backing features). Pricing is a real page — tiers are MVP-locked.

---

## A. Public website

### `/` — Home
- **Role**: visitor (redirects nowhere; authenticated users see a "Go to dashboard" header CTA)
- **Goal**: understand what Share-k is, decide to join as contributor or owner
- **Primary action**: Get started (register) — split entry: "I want to contribute" / "I have a project"
- **Secondary**: Explore projects, Sign in, language toggle (ar/en)
- **Required info**: value proposition, how-it-works flow (GitHub → analysis → review → verified profile → matched contribution), AI transparency promise (admin review of AI skills — a trust differentiator worth marketing), featured published projects (real data), tier comparison teaser
- **States**: default; sample-data labeling on any metrics (no fabricated claims)
- **Connects to**: `/register`, `/login`, `/explore`, `/pricing`
- **Priority**: MVP · **[Confirmed — sprint 1 scaffolding; content structure UX-Required]**

### `/explore` — Explore projects
- **Role**: visitor + contributor (owner can view; not their surface)
- **Goal**: find a project matching skills and interest
- **Primary action**: open a project
- **Secondary**: filter (technology, category `web|mobile|ai_ml|devops|tools_utilities`, difficulty `beginner|intermediate|advanced` — all **[Confirmed]** FR-041–FR-044), semantic search (FR-045), sort
- **Required info**: project cards — title, description, tech tags, languages, difficulty, category, repo stats, open task count **[UX-Required: open task count not in FR but needed to judge "can I contribute now?"]**; authenticated contributors additionally see relevance/match hints
- **States**: loading (skeleton grid), results, empty-filters ("no projects match — widen filters"), error, unauthenticated (no match hints, CTA to join)
- **Connects to**: `/projects/$projectId`, filters ↔ URL search params
- **Layout note**: filters = desktop sidebar, mobile bottom sheet
- **Priority**: MVP · **[Confirmed]**

### `/projects/$projectId` — Project details (public view)
- **Role**: visitor + contributor
- **Goal**: evaluate "is this project worth my time, and can I qualify?"
- **Primary action**: view open contribution tasks → task details
- **Secondary**: visit GitHub repo, view owner profile
- **Required info**: title, description, README-derived overview, languages %, tech tags, category, difficulty, repo stats, owner identity, open contribution requests list, activity recency; authenticated contributor: personal fit hints per task ("2 of 3 required skills verified") **[UX-Required — pre-application eligibility hint; see OQ-D4]**
- **States**: loading, found, not-found, archived ("no longer accepting contributions" — history preserved), unauthenticated (tasks visible, apply prompts login)
- **Connects to**: `/tasks/$taskId`, `/profile/$username` (owner), `/explore`
- **Priority**: MVP · **[Confirmed]**

### `/pricing` — Plans
- **Role**: visitor + all authenticated roles
- **Goal**: understand Bronze/Silver/Gold for their role
- **Primary action**: choose plan (→ register or → subscription settings)
- **Secondary**: toggle contributor/owner plan tables
- **Required info**: exact limits — owner: 10/20/30 orders/mo, matching top-5/top-10, priority visibility, Gold commission-free; contributor: 2/3/4 apps/day, matched notifications, Gold recommendations + gap guidance + no commission **[Confirmed FR-073–FR-082]**
- **States**: anonymous, authenticated (current plan highlighted)
- **Connects to**: `/register`, `/settings/subscription`
- **Priority**: MVP. **Payments decided (DEC-026)**: no checkout in MVP — plans are admin-assigned/seeded; the upgrade action is disabled with copy "Plan purchasing is not available during the MVP preview." Never render a functional-looking purchase CTA

### `/profile/$username` — Contributor public profile
- **Role**: all (public read proposed; currently auth-gated **[Existing conflict** — spec 001 gates it behind `_appLayout`; FR-066 says "public reputation profile". See open-questions.md OQ-D2])
- **Goal**: judge a contributor's verified capability (owner evaluating an applicant; contributor sharing their profile as a portfolio)
- **Primary action**: none (read surface); owner arrives here from application review
- **Secondary**: view GitHub profile, report user
- **Required info**: identity, verified skills (approved only, with proficiency), reputation (rating, completed count, success rate, top skills **[Confirmed FR-067–FR-070]**), reviews received, contribution history; owner-only extras when viewing own: private fields **[Existing]**
- **States**: loading, found, not-found **[Existing]**, own-profile (edit affordances), pending-review profile viewed by others (show only approved data)
- **Connects to**: `/skills` (own), delivery reviews
- **Priority**: MVP · **[Existing — redesign]**

### `/login`, `/register`, `/forgot-password` — Auth
- **Role**: visitor
- **Goal**: enter the platform
- **`/register` [Existing]**: email, password, first/last name, **platform username** (confirmed by user; GitHub-suggested when available — DEC-016), **role selection (contributor | owner)** as explicit outcome-framed cards, not a dropdown **[Confirmed — register API takes role]**. Copy per DEC-001: *"Choose how you want to use Share-k initially. Additional roles may be supported later."* — never say the role can never change (a change may require admin intervention in MVP); preferred language ar/en
- **`/login` [Existing]**: role-aware redirect after login (contributor → profile/dashboard, others → home) **[Existing]**; redesign target: → `/dashboard` for all roles, onboarding-incomplete users → `/onboarding` **[UX-Required]**
- **`/forgot-password` [Existing route — backend flow APPROVED (DEC-012): `POST /auth/forgot-password` + `POST /auth/reset-password`, non-enumerating, single-use 15–30min tokens; see api-contract-additions.md §1]**
- **States**: idle, submitting, error (per-field + normalized API error), success-redirect
- **Priority**: MVP

---

## B. Contributor application (`_appLayout`, role = contributor)

### `/onboarding` — Activation flow (stepper, one route, step state)
The contributor's critical path from registration to "fully active." Steps are sequential, resumable, each with distinct states. A flow, not separate pages — users cannot meaningfully jump between steps. **[Confirmed — FR-011–FR-014, FR-027–FR-033; GITHUB_ACCOUNT.ingestion_status; sprint-2 designs]**
1. **Connect GitHub** — OAuth start → callback; explains exactly what data is read (repos, README, languages, commits) and why. States: disconnected, connecting, connected, failed (retry).
2. **Analysis** — ingestion + AI profiling progress. States: queued, in_progress (live stage feedback: fetching repos → analyzing languages → extracting skills), completed, failed (retry path).
3. **Generated profile preview** — contributor sees skills before admin review; can flag obvious errors early **[UX-Required — reduces disputes; preview itself is confirmed by sprint-2 "pending skill profile review screen"]**.
4. **Pending admin review** — waiting state with expectation ("usually within X"); notification promise. Terminal states: approved (→ celebrate → dashboard), partially approved, all-rejected (→ guidance on what to do).
- **Connects to**: `/dashboard`, `/skills`
- **Priority**: MVP — this is the make-or-break flow of the product.

### `/dashboard` — Contributor dashboard
- **Goal**: "what needs my attention, and what should I do next?"
- **Primary action**: contextual — resume onboarding / review matched tasks / act on application updates
- **Secondary**: quick links to feed, profile, notifications
- **Required info** (action-ranked, not metric-ranked): attention items (application status changes, delivery feedback, revision requests), profile status banner (pending/partial/approved), recommended tasks (Gold: AI-recommended **[Confirmed FR-080]**; others: recent matching-tech tasks), reputation snapshot with deltas, daily application quota remaining **[Principle 7]**
- **States**: onboarding-incomplete (dashboard is a guided checklist), active-empty (approved but no applications — push to explore), active, plan-limit-reached
- **Connects to**: everything; the hub
- **Priority**: MVP

### `/tasks` — Contribution task feed
- **Goal**: find a task to apply to today
- **Primary action**: open task details
- **Secondary**: filter (technology, difficulty, reward presence, deadline), sort (newest, deadline, reward)
- **Required info**: task cards — title, project, required technologies, difficulty, deadline, reward (if any), applicants indicator, personal eligibility hint ("your verified skills cover 3/3") **[UX-Required — see OQ-D4]**
- **States**: loading, results, empty, filtered-empty, error
- **Connects to**: `/tasks/$taskId`, `/projects/$projectId`
- **Priority**: MVP · **[Confirmed FR-048]**
- *Note*: `/explore` answers "which project?"; `/tasks` answers "which work item now?" Both are confirmed surfaces (project discovery FR-040; order feed FR-048).

### `/tasks/$taskId` — Task details + application flow
- **Goal**: evaluate requirements honestly, then apply
- **Primary action**: **Apply** (with quota shown: "1 of 2 today remaining") → apply modal: optional cover message → submit → live AI-validation state
- **Secondary**: view project, view owner profile, report task
- **Required info**: full description, required technologies vs. contributor's verified skills (side-by-side match preview **before** applying), difficulty, deadline, reward, max applicants, project context
- **States**: open (applications open), already-applied (show application status inline), assigned/completed/cancelled (read-only with reason), quota-exhausted (apply disabled + reset time), profile-not-approved (apply disabled + explain gate **[Confirmed FR-014]**), post-submit: validating → eligible ("sent to owner") / ineligible (→ rejection-with-next-steps, Gold: gap guidance entry) / review_needed ("a human will take a look") **[Confirmed — AI_VALIDATION_RESULT.decision]**
- **Connects to**: `/applications/$applicationId` (after submit), `/projects/$projectId`
- **Priority**: MVP — the single most important interaction in the product.

### `/applications` — My applications & contributions
- **Goal**: track everything applied to and in progress
- **Primary action**: open an application
- **Tabs**: **Active** (pending_validation, eligible, accepted + delivery in flight) · **Needs action** (revision_requested, accepted-without-delivery) · **History** (completed, rejected, ineligible, withdrawn)
- **Required info**: per row — task, project, status chip (see state-model.md for labels), last update, next actor ("waiting on owner")
- **States**: loading, empty ("no applications yet" → tasks feed), populated
- **Connects to**: `/applications/$applicationId`
- **Priority**: MVP

### `/applications/$applicationId` — Application detail (pipeline page)
- **Goal**: see exactly where this application stands and act
- **Primary action**: stage-dependent — submit PR link (accepted), resubmit (revision_requested), view guidance (ineligible + Gold), dispute (ineligible), withdraw (before acceptance **[Confirmed]**)
- **Required info**: full pipeline visualization (applied → validated → owner review → delivery → review → completed), AI validation result (decision, confidence, justification, matched/missing skills **[Confirmed]**), owner feedback + rating once reviewed, delivery status, gap guidance panel (Gold, streamed **[Confirmed FR-085]**)
- **States**: one per pipeline stage; failure states: ineligible (+/− guidance), owner-rejected, delivery-rejected, withdrawn
- **Connects to**: `/tasks/$taskId`, dispute flow (modal → creates DISPUTE), `/skills`
- **Priority**: MVP

### `/skills` — My skill profile
- **Goal**: understand what the platform believes about me, and improve it
- **Primary action**: request re-analysis (after new GitHub activity — ERD business rule 4 **[Confirmed]**)
- **Secondary**: dispute a skill assessment (→ DISPUTE modal), view evidence per skill
- **Required info**: per skill — name, proficiency, status (`pending/approved/rejected/disputed` **[Confirmed]**), confidence, evidence summary + sources, admin adjustment (with original level, honest about the change); GitHub connection status + last synced; ingestion status if re-analyzing
- **States**: all-pending (in review), mixed, has-rejected (with dispute affordance), disputed-in-progress, re-analysis-running, github-disconnected (blocks re-analysis)
- **Connects to**: `/profile/$username` (public view of self), `/onboarding` (if never completed), dispute flow
- **Priority**: MVP

### `/notifications` — Notification center
- **Goal**: catch up on everything that changed
- **Primary action**: open the referenced entity (deep link via `metadata`)
- **Secondary**: mark read / mark all read
- **Required info**: typed notifications (`application_status, skill_review, delivery_update, match_found, task_recommendation, plan_limit, system` **[Confirmed]**), grouped by day, unread badge count (lifted to global state per ARCHITECTURE.md)
- **States**: empty, unread-present, all-read
- **Pattern**: popover (top 5 + "view all") from the shell header **and** this full page
- **Priority**: MVP

### `/settings` — Settings (tabbed)
- **Tabs**: **Account** (name, avatar, password), **Language** (ar/en — instant RTL/LTR switch), **GitHub** (connection status, disconnect **[Existing endpoint]**, re-sync), **Subscription** (`/settings/subscription`: current plan, usage meters — today's applications, benefits, upgrade CTA → pricing) **[Confirmed]**
- **States per tab**: idle, saving, saved, error; GitHub: connected/disconnected/syncing
- **Priority**: MVP (Account/Language/GitHub); Subscription MVP-with-placeholder-payment

---

## C. Project owner application (`_appLayout`, role = owner)

### `/onboarding` — Owner activation (lighter flow)
1. Connect GitHub (same component, owner copy: "to import your repositories")
2. Import first project (repo picker from `GET /github/repositories` **[Existing]**) — skippable ("I'll do this later")
- **Priority**: MVP · **[Confirmed FR-001]**

### `/dashboard` — Owner dashboard
- **Goal**: "what needs my review right now?"
- **Primary action**: jump into review queues
- **Required info** (action-ranked): pending eligible applications count + oldest-waiting, deliveries awaiting review (most time-sensitive — a contributor is blocked on you), per-project pipeline summary, monthly order usage meter **[Principle 7]**, AI match digests (Silver/Gold **[Confirmed]**)
- **States**: no-projects (import CTA — mirrors onboarding), projects-no-requests, active, order-limit-reached
- **Priority**: MVP

### `/my-projects` — My projects
- **Goal**: manage the project portfolio
- **Primary action**: **Import project** (→ `/my-projects/new`)
- **Required info**: per project — title, status (`draft/published/archived` **[Confirmed]**), open requests count, pending applications count, last activity
- **States**: empty (first import CTA), populated
- **Priority**: MVP

### `/my-projects/new` — Import & publish flow (stepper)
1. **Pick repository** (from connected GitHub; or paste `owner/repo` **[Existing endpoint `POST /projects/import/github`]**). States: loading repos, import-running, import-failed (actionable error: not found / private / rate-limited **[UX-Required]**)
2. **Review metadata** — edit auto-fetched title, description, tags, technologies; set category + difficulty (fetched fields marked "from GitHub") **[Confirmed FR-003, FR-036]**
3. **Publish** — confirm; explains visibility ("appears in contributor discovery"). Draft is saved at every step; abandoning keeps a draft **[Confirmed — PROJECT.status draft]**
- **Priority**: MVP

### `/my-projects/$projectId` — Project management (tabbed)
- **Tabs**:
  - **Overview** — metadata (edit), status control (publish / archive with consequence explanation), repo stats, re-sync from GitHub **[UX-Required — metadata drifts]**
  - **Requests** — contribution requests list with per-request pipeline counts (applications / eligible / accepted / delivered); **Create request** CTA showing monthly quota ("14 of 20 this month") **[Confirmed FR-050]**
  - **Activity** **[Future]** — cross-request timeline
- **States**: draft (publish nudge), published, archived (read-only + unarchive **[Proposed — see state-model.md]**)
- **Priority**: MVP

### `/my-projects/$projectId/requests/new` — Create contribution request
- **Form**: title, description, required technologies (tag input), difficulty, deadline (optional), reward + currency (optional), max applicants **[Confirmed FR-047; ERD]**
- **Primary action**: Publish (or Save draft)
- **States**: idle, quota-blocked (limit reached — shown *before* form entry per Principle 7), saving, published
- **Priority**: MVP

### `/my-projects/$projectId/requests/$requestId` — Request management (tabbed)
The owner's main working surface.
- **Tabs**:
  - **Applications** — eligible applications only **[Confirmed FR-005]**, with a transparency line: "12 applications received · 4 passed AI validation". Cards: contributor identity + reputation, matched/missing skills, AI justification + confidence, priority flag (Gold **[Confirmed]**), cover message. Actions: Accept / Reject (with optional reason **[UX-Required — feeds contributor experience]**). Accept consequences explained (task → assigned).
  - **Matches** (Silver/Gold) — AI-suggested contributors (top 5/10 **[Confirmed FR-074–075]**) with justification; actions: view profile, **Invite [APPROVED — DEC-003: `task_invitations` entity; invitation never bypasses validation or quota; copy "Your verified skills appear to match…", never "You have been selected"]**. Gold: auto-notify top matches on publish. Bronze: locked-state preview with plan explanation.
  - **Delivery** — submitted PR link, contributor notes, review actions: **Approve (rating 1–5 required + feedback)** / Request revision / Reject **[Confirmed — DELIVERY_REVIEW]**. Approval consequence: "marks the contribution complete and updates the contributor's reputation."
  - **Details** — edit request (until assigned), cancel (with confirmation; explains effect on applicants).
- **States**: draft, published-no-applications, applications-pending-review, assigned-awaiting-delivery, delivery-under-review, completed, cancelled
- **Priority**: MVP

### `/notifications`, `/settings` — shared with contributor (owner notification types: applications, deliveries, matches; subscription tab shows owner plans)

---

## D. Admin application (`_adminLayout`, role = admin, `/admin/*`)

Scope decision: MVP admin covers exactly the confirmed FRs — skill review, reports, disputes, user management. Platform-activity analytics and AI-trace browsing are **[Future]** (Langfuse covers operational AI tracing per sprint 7–8).

### `/admin` — Admin dashboard
- **Required info**: queue counts + aging (pending skill profiles, open disputes, open reports), oldest-waiting indicators (review latency blocks contributor activation — the platform's bottleneck metric)
- **Primary action**: enter a queue
- **Priority**: MVP

### `/admin/skill-reviews` — Pending skill profiles queue
- **Goal**: work through pending contributor profiles fast and fairly
- **Required info**: per row — contributor, generated skill count, average confidence, waiting time; sort oldest-first (default)
- **Primary action**: open review
- **States**: empty ("queue clear"), populated, aging-warning
- **Priority**: MVP · **[Confirmed FR-023]**

### `/admin/skill-reviews/$userId` — Skill review workspace
- **Goal**: evidence-grounded per-skill decisions in one screen
- **Layout**: skills table (name, AI proficiency, confidence, evidence summary) + evidence panel (sources: repos/files/commits with GitHub links) + contributor context (GitHub profile, account age)
- **Actions per skill**: Approve / Adjust proficiency (records `original_proficiency` **[Confirmed]**) / Reject (reason → `admin_notes`); batch: approve remaining; finish review (notifies contributor **[Confirmed — notification type `skill_review`]**)
- **States**: unreviewed, partially-reviewed (resumable), completed, re-generated-after-resync (diff against previous review **[UX-Required]**)
- **Priority**: MVP — second most important screen in the product after task-apply.

### `/admin/disputes` + detail drawer
- **Goal**: resolve `skill_assessment` / `validation_decision` challenges
- **Required info**: contributor's reason + evidence, the original AI output (skill or validation result with justification/confidence/sources), related history
- **Actions**: Uphold / Overturn (triggers re-evaluation **[Confirmed — ERD dispute rule 2]**) / Dismiss, with resolution notes (required)
- **Pattern**: list page + detail drawer (dispute context fits a focused panel; full page not needed)
- **Priority**: MVP · **[Confirmed FR-059]**

### `/admin/reports` + detail drawer
- **Goal**: investigate fraud/misuse/manipulation/inaccurate-AI/harassment reports
- **Required info**: reporter, reported entity (polymorphic — user/project/request/application/delivery/skill profile **[Confirmed]**), reason, description
- **Actions**: start investigation, resolve with notes, dismiss; follow-up actions: suspend user (`USER.status: suspended` **[Confirmed]**), archive project
- **Priority**: MVP · **[Confirmed FR-025–026]**

### `/admin/users` — User management
- **Goal**: find a user, adjust role **[Existing endpoint]**, suspend/reactivate
- **Required info**: search, role/status filters, per-user drawer (profile, skills, subscriptions, reports involving them)
- **Priority**: MVP (basic), advanced filters **[Future]**

### `/admin/projects` — **[Future]** (moderation happens via reports in MVP)
### `/admin/ai-history` — **[Future]** (Langfuse serves this operationally)

---

## E. Excluded from MVP (explicit)

| Item | Reason | Label |
|---|---|---|
| Saved projects | No entity, no FR | [Future] |
| Community pages | No backing features | [Future] |
| Project chat / discussion / kanban / roadmaps (in `docs/ARCHITECTURE.md` module list) | Not in PRD or ERD — architecture doc anticipates them; PRD is source of truth for MVP. **Documented conflict**, see open-questions.md OQ-C1 | [Future] |
| Owner public profile page | Useful trust surface but no FR; owner identity appears on project pages | [Future — recommended] |
| Role switching contributor↔owner | Single-enum role in ERD | [Future — see OQ-P1] |
| Standalone guidance library | Guidance is per-application in MVP | [Future] |
