# Share-k — Core User Journeys (Step 5)

> **Contributor policy correction (DEC-030–DEC-035, 2026-07-20):** contributor AI fit is advisory and owner-decided; contributor quotas/Gold restrictions and GitHub-only evidence assumptions are superseded. GitHub OAuth links identity only; evidence authorization requires explicit GitHub App repository selection; non-GitHub evidence and contextual accepted-contributor access must be supported by approved contracts. Conflicting contributor steps below are retained only until this journey document is fully migrated. Use `contributor-experience-brief.md` for implementation.

> The 38 journey items requested are grouped into 11 journey maps — many items are stages of one continuous experience and designing them separately would fracture the flow. Every requested item is covered and cross-referenced.
> State labels reference `state-model.md`. Screens reference `screen-inventory.md`.

---

# Contributor journeys

## CJ-1 · Registration → Activation
*Covers: registration, role selection, GitHub connection, GitHub analysis, AI skill profile generation, pending admin review, profile approval (items 1–7).*

- **Entry**: home "Get started", pricing, or direct `/register` link.
- **Preconditions**: none (new user); has a GitHub account with some activity.
- **Goal**: become a fully active contributor able to apply to tasks.
- **Steps & decisions**:
  1. Register (email, password, name, platform username [DEC-016], language). **Decision: role** — contributor vs. owner, presented as two outcome-framed cards ("Contribute and build verified experience" / "Publish projects and find contributors"). Copy per DEC-001: "Choose how you want to use Share-k initially. Additional roles may be supported later." (no role switching in MVP UI; never say "never"). [Confirmed — register API]
  2. → `/onboarding` step 1: **Connect GitHub**. Consent screen lists exactly what is read (public repos, READMEs, languages, commit activity) and why, before redirecting to GitHub OAuth. [Confirmed FR-027–028]
  3. OAuth return → step 2: **Analysis**. Live progress through ingestion stages (`GITHUB_ACCOUNT.ingestion_status`) then AI profiling. User can leave; notification + resumable state. [Confirmed]
  4. → step 3: **Generated profile preview**. Skills with proficiency + confidence + evidence. Decision: contributor can flag an obviously wrong skill *before* admin review [UX-Required].
  5. → step 4: **Pending admin review**. Expectation-setting copy; "we'll notify you." Meanwhile: explore is open, applying is gated with the reason shown. [Confirmed FR-014]
  6. Admin decision → notification `skill_review` → **approved / partially approved / rejected** outcome screen.
- **Success**: ≥1 approved skill → activation moment (dashboard unlocks applying; celebrate briefly, then point to matched tasks).
- **Failure states**: OAuth denied/cancelled (retry, explain why GitHub is required — no GitHub-less path in MVP [Confirmed FR-011]); ingestion `failed` (retry CTA, support link); AI generation produces zero skills (honest empty result → guidance: "add public repos, then re-analyze"); admin rejects all (path: read reasons → dispute or improve GitHub → re-analyze).
- **Empty/loading**: analysis stage feedback is the loading state; never a blank spinner (Principle 4).
- **Permissions**: all steps require session; steps sequential.
- **Trust concerns**: OAuth scope fear → consent copy + "disconnect anytime" (settings). AI judging fear → preview + dispute path visibility.
- **Recovery**: every terminal failure has exactly one obvious next action (retry / re-analyze / dispute).
- **Notifications**: analysis complete; review decision (`skill_review`).

## CJ-2 · Discovery → Evaluation
*Covers: project discovery, project evaluation, contribution-task evaluation (items 8–10).*

- **Entry**: dashboard "recommended", sidebar Explore/Tasks, notification `task_recommendation` (Gold), public link.
- **Preconditions**: none to browse; approved profile to see personal fit.
- **Goal**: choose a task worth one of today's limited applications.
- **Steps & decisions**:
  1. `/explore` or `/tasks` → filter by stack/category/difficulty; semantic search ("realtime chat in Go"). [Confirmed FR-041–045]
  2. Project details → judge health: activity, languages, owner, open tasks. **Decision: worth my time?**
  3. Task details → requirement-vs-my-skills panel ("Node.js ✓ verified · JWT ✗ not in your profile"). **Decision: apply, pick another, or study first?** — the honest pre-check protects the daily quota and reduces doomed applications [UX-Required, OQ-D4].
- **Success**: confident apply decision (proceeds to CJ-3) — or a confident *not now* with alternatives ("4 similar tasks match you fully").
- **Failure/empty**: no results (widen-filters CTA); zero fully-matched tasks (nearest matches + what's missing); unauthenticated (fit panel replaced by join CTA).
- **Loading**: skeleton cards; filters stay interactive during fetch.
- **Trust concerns**: match hints must be evidence-based and honest — overpromising here poisons the AI gate moment later.
- **Notifications**: none required; Gold recommendations arrive via `task_recommendation`.

## CJ-3 · Application — eligible path
*Covers: AI eligibility check, eligible application, owner acceptance (items 11–12, 15).*

- **Entry**: task details → Apply (quota shown on button).
- **Preconditions**: approved profile; quota available; task open; not already applied. [Confirmed]
- **Steps**:
  1. Apply modal: optional cover message → submit.
  2. **AI validation** (`pending_validation`): brief inline progress — "comparing task requirements against your verified skills." If long-running, close-and-notify.
  3. Decision `eligible` → "Sent to @owner for review" + justification + what happens next. [Confirmed FR-054]
  4. Waiting on owner (application detail shows pipeline, "waiting on owner").
  5. Owner accepts → notification → application detail flips to **accepted**: task contact info, deadline, "submit your PR here when ready" (→ CJ-5). Owner rejects → honest state + reapply-elsewhere path.
- **Success**: accepted; contributor knows exactly what to do next.
- **Failure**: `REVIEW_NEEDED` (low confidence → "a human will review; nothing to do" — persisted status, admin/support resolves, never the owner [DEC-013]); technical failure → `VALIDATION_FAILED` with **automatic quota refund** and retry [DEC-006]; owner never responds → day-3 owner nudge, day-5 overdue, **day-7 auto-expiry** (`EXPIRED`, no reputation harm, reapply allowed while open) [DEC-004].
- **Decisions**: withdraw (allowed before acceptance [Confirmed]).
- **Trust**: show the AI's justification *even when eligible* — trust is built on positive decisions too.
- **Notifications**: `application_status` at every transition (validated, accepted/rejected).

## CJ-4 · Application — ineligible path & skill-gap guidance
*Covers: ineligible application, skill-gap guidance (items 13–14).*

- **Entry**: same as CJ-3, AI returns `ineligible`.
- **Steps**:
  1. Rejection screen — Principle 5 layout: honest reason (missing skills, justification) → forward actions ranked: (a) tasks you *do* match today, (b) dispute this decision, (c) Gold: your personalized gap plan / non-Gold: what Gold guidance includes (reason itself never paywalled [Confirmed FR-019 vs FR-057]).
  2. **Gold**: guidance streams in (missing skills → recommended tech → learning resources → practice projects → estimated timeline "2–3 weeks"). Persisted on the application detail for later. [Confirmed — SKILL_GAP_GUIDANCE, FR-085]
  3. **Decision**: act on guidance → later re-analyze skills → retry similar task. The loop closes: "you were missing JWT — after your next analysis this updates."
- **Success**: contributor leaves with a plan, not a wound. Measured by: returns and re-applies later.
- **Failure**: guidance generation fails (retry; never block on it); dispute filed → admin queue (AJ-2).
- **Trust**: the dispute entry point must be visible on the rejection itself. [Confirmed FR-059]
- **Notifications**: application ineligible (`application_status`); guidance ready if async.

## CJ-5 · Delivery → Approval → Reputation
*Covers: work delivery via PR link, owner approval, rating & reputation update (items 16–18).*

- **Entry**: accepted application (notification or `/applications` "needs action" tab).
- **Preconditions**: `application.status = accepted`. [Confirmed]
- **Steps & decisions**:
  1. Work happens on GitHub (outside platform). Application detail shows deadline and expectations.
  2. **Submit delivery**: PR URL (validated format) + optional notes. [Confirmed — DELIVERY]
  3. Status `submitted` → `under_review` — "waiting on owner review."
  4. Owner outcome: **approved** (→ step 5) · **revision_requested** (feedback shown → contributor revises PR → resubmit; delivery returns to review [Confirmed — DELIVERY.status]) · **rejected** (reason + rating shown; dispute/report path for unfair treatment).
  5. Approved → completion moment: rating + feedback received, reputation delta shown ("4.6 → 4.7 · 6 completed · success 92%"), share-profile prompt. [Confirmed FR-065, REPUTATION_RECORD recalculation]
- **Success**: contribution counted, reputation visibly moved (Principle 8).
- **Failure**: wrong PR URL (inline validation); deadline passed before delivery (state shows it; owner may still review or cancel); repeated revision loops (each round preserves feedback history).
- **Trust**: rating criteria transparent; reputation formula explained on profile ("computed only from approved deliveries and owner ratings").
- **Notifications**: `delivery_update` on submit (to owner) and each outcome (to contributor).

---

# Project owner journeys

## OJ-1 · Registration → First published project
*Covers: registration, GitHub connection, repository import, metadata review, project publishing (items 1–5).*

- **Entry**: home "I have a project" → register as owner.
- **Goal**: project live in contributor discovery.
- **Steps & decisions**:
  1. Register (role = owner) → `/onboarding`: connect GitHub (owner copy: "to import your repositories"). [Confirmed FR-001]
  2. Import: pick from repo list (`GET /github/repositories` [Existing]) or paste `owner/repo`. Import runs (`POST /projects/import/github` [Existing]) → draft project with fetched metadata. [Confirmed FR-034–035]
  3. **Review metadata**: fetched fields labeled "from GitHub"; owner edits description/tags, **decides category + difficulty** (these drive discovery filters and matching — help text must say so). [Confirmed FR-003, FR-036]
  4. **Publish** decision — consequence stated: visible to all contributors; metadata indexed for semantic search. [Confirmed FR-037–038]
- **Success**: published state + immediate next step: "create your first contribution request."
- **Failures**: repo not found / private / rate-limited (distinct, actionable errors); duplicate repo URL — already imported by anyone [Confirmed — unique constraint] (explain + support path); import partially fails (draft saved with missing fields flagged).
- **Empty/loading**: repo list skeleton; import progress with stage feedback.
- **Permissions**: owner or admin only. [Existing]
- **Trust**: owner must feel in control of what's published — nothing goes live without explicit confirm. [Confirmed]
- **Notifications**: none needed (synchronous flow).

## OJ-2 · Contribution request creation → AI matching
*Covers: contribution-request creation, AI contributor matching (items 6–7).*

- **Entry**: project Requests tab → "New request" (quota preview on button).
- **Preconditions**: published project; monthly order quota available. [Confirmed FR-050]
- **Steps & decisions**:
  1. Form: title, description, **required technologies** (decision: these are the AI gate criteria — inline guidance: "applicants are AI-checked against these; over-specifying filters everyone out"), difficulty, deadline, optional reward, max applicants. [Confirmed FR-047]
  2. Publish → task appears in contributor feed; requirements indexed. [Confirmed FR-048–049]
  3. **Silver/Gold**: Matches tab populates (top 5/10 with justification + confidence [Confirmed FR-074–075]). **Decision**: review matches → view profiles → **invite [APPROVED — DEC-003]** (invitation notifies via `match_found`; contributor still applies normally through AI validation and quota). Gold: best matches auto-notified on publish [Confirmed FR-075].
- **Success**: published request with visible pipeline; matches surfaced for premium.
- **Failures**: quota exhausted (blocked *before* form, reset date + upgrade path); zero matches (honest: "no strong matches yet — notify me" [UX-Required]); matching service down (tab shows retry, rest of page unaffected).
- **Trust**: match reasoning expandable; Bronze sees an honest locked preview, not a dark pattern.
- **Notifications**: Gold auto-notify to matched contributors (`match_found`).

## OJ-3 · Application review → Acceptance
*Covers: application review, contributor acceptance (items 8–9).*

- **Entry**: notification (`application_status`) or dashboard "needs review" → request Applications tab.
- **Preconditions**: request published; ≥1 eligible application. Owners see only AI-eligible applications. [Confirmed FR-005]
- **Steps & decisions**:
  1. Applications list — transparency line ("12 received · 4 passed validation") + eligible cards: contributor, reputation, matched/missing skills, AI justification, confidence, Gold priority flag, cover message.
  2. Inspect: expand justification; open contributor profile (verified skills, history, reviews).
  3. **Decision: accept or reject.** Accept consequence [DEC-005]: request → `ASSIGNED`; all other pending applications automatically become `NOT_SELECTED` (distinct from rejection) and every affected contributor is notified — copy: "Another contributor was selected for this request. This does not affect your eligibility status or reputation." New applications close. Reject (`REJECTED_BY_OWNER`): optional reason (feeds contributor's experience).
- **Success**: accepted contributor; both sides know next steps (delivery expectations).
- **Failures**: no eligible applications after N days → calibration nudge ("consider fewer required technologies or lower difficulty") [UX-Required]; accidentally rejected (undo within session [Proposed]).
- **Trust**: "AI pre-validated ✓" must feel like a shortlist, not a verdict — the decision belongs to the owner (Principle 3).
- **Notifications**: to contributor on accept/reject; to owner when new eligible applications arrive.

## OJ-4 · Delivery review → Rating
*Covers: delivery review, contribution approval/rejection, contributor rating (items 10–12).*

- **Entry**: notification `delivery_update` or dashboard → request Delivery tab.
- **Preconditions**: delivery `submitted`. [Confirmed]
- **Steps & decisions**:
  1. Review surface: PR link (opens GitHub), contributor notes, task requirements side-by-side checklist.
  2. **Decision: approve / request revision / reject.** [Confirmed — DELIVERY_REVIEW.outcome]
     - Approve → **rating 1–5 required** + feedback (encouraged); consequence stated: "completes the contribution and updates @dev's reputation." [Confirmed]
     - Request revision → feedback required; contributor resubmits; loop preserved with history.
     - Reject → reason required; consequence on both sides explained.
  3. Post-approval: request → `completed`; closure summary.
- **Success**: reviewed delivery, rating captured at the moment of decision (not a separate chore — response rates die otherwise). [Confirmed FR-062–063 capture point]
- **Failures**: PR link dead/changed (report to contributor, request resubmission); owner disappears mid-review (delivery ages `under_review` — aging surfaced to admin [Proposed]).
- **Trust**: rating is consequential — the UI should slow this decision down slightly (confirm step), the opposite of most actions.
- **Notifications**: each outcome to contributor; completion to both.

---

# Admin journeys

## AJ-1 · Skill profile review
*Covers: review generated profile, inspect evidence, adjust proficiency, approve, reject (items 1–5).*

- **Entry**: `/admin/skill-reviews` queue (oldest first) or notification of new pending profile.
- **Preconditions**: admin role; profile with `pending` skills.
- **Steps & decisions**:
  1. Open review workspace: all generated skills + confidence + evidence summary; evidence panel deep-links (repos, files, commits); contributor's GitHub for spot-checks.
  2. Per skill, **decision: approve / adjust proficiency / reject**. Adjust records `original_proficiency`; reject requires a reason (`admin_notes`) — the contributor reads it, write for them. [Confirmed FR-024, FR-031]
  3. Ambiguous skill → skip and continue (partial review resumable); "needs clarification" state is [Proposed — not in ERD, see state-model.md §1].
  4. Finish review → summary confirm → contributor notified; approved skills become eligibility-active. [Confirmed FR-014]
  5. Next-in-queue → repeat (keyboard-driven throughput).
- **Success**: reviewed profile; contributor unblocked; audit trail complete (`reviewed_by`, `reviewed_at`).
- **Failures**: evidence links broken (mark skill "insufficient evidence" → reject with note); AI output malformed (flag for re-generation, never guess-approve — no silent trust decisions [Confirmed PRD AI acceptance criteria]).
- **Empty**: queue clear state.
- **Trust**: admin accountability — decisions logged and visible in the profile's review history.
- **Notifications**: `skill_review` to contributor on completion.

## AJ-2 · Disputes, reported inaccuracies & moderation
*Covers: reported inaccuracy review, application dispute review, platform report moderation (items 6–8).*

- **Entry**: `/admin/disputes` or `/admin/reports` queues (badged).
- **Preconditions**: open dispute (`skill_assessment` | `validation_decision`) or report (`fraud | misuse | reputation_manipulation | inaccurate_ai | harassment | other`). [Confirmed]
- **Steps & decisions**:
  1. **Dispute**: drawer shows contributor's reason + evidence vs. the original AI output (assessment or validation with justification/confidence/sources), side by side.
  2. **Decision: uphold / overturn / dismiss** + required resolution notes. Overturn triggers re-evaluation (skill re-review or validation override). Disputed claims never qualify while open. [Confirmed — DISPUTE rules]
  3. **Report**: inspect polymorphic target in context → investigate → **decision: resolve (with action: suspend user / archive project / correct record) or dismiss**, notes required. [Confirmed FR-025–026]
- **Success**: resolved with reasoning both parties can read; platform trust preserved.
- **Failures**: insufficient evidence (request more from reporter [Proposed]); repeat offender (user history visible in drawer).
- **Trust**: symmetric fairness — the contributor who disputed gets the resolution reasoning, not just a verdict.
- **Notifications**: resolution to involved parties (`system`).

---

## Journey-wide requirements

- **Every wait state names the next actor** (AI / admin / owner / you) — Principle 4.
- **Every failure state has exactly one primary recovery action.**
- **Notification types map 1:1 to ERD enum** (`application_status, skill_review, delivery_update, match_found, task_recommendation, plan_limit, system`) [Confirmed] — no journey invents a new type without flagging it.
- **Quota touchpoints** (apply, create request) always show remaining usage before the act — Principle 7.
- **Bilingual**: journey copy exists in ar + en; RTL mirrors steppers and pipelines (see navigation-model.md).
