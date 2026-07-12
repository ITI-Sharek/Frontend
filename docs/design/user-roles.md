# Share-k — User Roles & Needs (Step 1)

> Phase: UX foundation for full redesign. Sources: PRD (`bmad/_bmad-output/planning-artifacts/prds/.../prd.md`, FR-001–FR-094), ERD (`bmad/_bmad-output/ERD/`), sprint backlog (`bmad/_bmad-output/sharek-backlog.md`).
> Labels used across all design docs:
> **[Confirmed]** = locked PRD/ERD requirement · **[Existing]** = already implemented in code · **[UX-Required]** = addition needed to complete a confirmed journey · **[Future]** = recommendation beyond MVP.

Share-k has three primary roles, stored on `USER.role` as `contributor | owner | admin` **[Confirmed]**. Users self-select `contributor` or `owner` at registration; admin accounts are provisioned, never self-registered **[Existing — `POST /auth/register` rejects role `admin`]**. Users also carry `preferred_language: ar | en` **[Confirmed]**, which makes bilingual UX a first-class requirement, not a nice-to-have.

---

## 1. Contributor

A developer — student, junior, career-switcher, or experienced OSS newcomer — who wants real contribution experience that can be *proven*, not just claimed.

### Goals
- Get an AI-verified skill profile generated from their real GitHub activity (FR-012).
- Discover projects and tasks that match their actual level (FR-015, FR-040–FR-045).
- Apply to tasks, get accepted, deliver PRs, and build a verified reputation (FR-017, FR-020, FR-021).
- Understand and close skill gaps when rejected (FR-019, FR-057).

### Motivations
- A portfolio that employers can trust: "verified React – Intermediate, 18 completed tasks, 4.8 rating" beats a self-written CV line.
- Structured entry into open source — real OSS is intimidating; Share-k pre-matches difficulty and states requirements upfront.
- Optional rewards on paid tasks.

### Frustrations (design must address)
- **Black-box AI decisions**: being told "ineligible" with no reason is the fastest way to lose them. Every gate decision must show justification (NFR-003).
- **Waiting without status**: GitHub analysis and admin review are asynchronous. Silent waiting states feel broken.
- **Wasted applications**: daily limits (Bronze 2/day) make each rejection costly; they need to *predict* eligibility before spending an application.
- **Feeling judged unfairly**: AI may miss skills (private repos, non-GitHub experience). The dispute path (FR-059) must be visible, not buried.

### Primary tasks (most frequent first)
1. Browse/filter the project & task feeds; check "can I do this?"
2. Check application status and notifications.
3. Apply to a contribution task.
4. Submit a PR link for an accepted task; track review.
5. Review own skill profile; request re-analysis after new GitHub work.
6. Read skill-gap guidance (Gold) and act on it.

### Important decisions they make
- Which task to spend a limited daily application on.
- Whether to dispute a skill assessment or validation outcome.
- Whether to upgrade tier (more applications, recommendations, gap guidance).
- Whether to withdraw an application.

### Required information
- Own skill profile with per-skill status (`pending/approved/rejected/disputed`), proficiency, confidence, and evidence sources.
- Task requirements vs. own approved skills (the gap, before applying).
- Application pipeline status end-to-end (validation → owner review → accepted → delivery → review → completed).
- Reputation metrics and what feeds them.
- Plan limits and remaining usage today.

### Trust concerns
- "Is the AI assessment fair, and can a human fix it?" → admin review + dispute path must be visible.
- "Who sees my profile and what parts?" → public profile vs. private fields (already implemented in contributor profile view **[Existing]**).
- "What GitHub data do you read and why?" → OAuth consent step must explain scope plainly.

### Failure scenarios to design for
- GitHub analysis fails (`ingestion_status: failed`) → retry path, not dead end.
- All generated skills rejected by admin → what now? Needs a "what to do next" state.
- Application ineligible (non-Gold) → honest explanation without the Gold guidance; clear upgrade path without dark patterns.
- Delivery rejected / revision requested → clear owner feedback and a resubmission path.
- Daily application limit hit → show when it resets; never fail silently after form fill.

---

## 2. Project Owner

A maintainer, developer, or team publishing open-source projects and requesting specific contribution work.

### Goals
- Import a GitHub repo, review metadata, publish it (FR-002, FR-003, FR-034–FR-037).
- Create structured contribution requests with requirements, difficulty, deadline, optional reward (FR-046–FR-047).
- Receive **only pre-qualified applicants** (FR-005) and pick the best (FR-006).
- Review PR deliveries, approve/reject, rate contributors (FR-007–FR-009).
- (Silver/Gold) Get AI-matched contributor shortlists (FR-074–FR-075).

### Motivations
- Review time is their scarcest resource; the AI gate is the product's core promise to them.
- Confidence that an applicant's skills are evidence-verified, not self-declared.
- Getting actual work merged into their project.

### Frustrations (design must address)
- **Unqualified applicants** — the exact problem Share-k solves; the UI must make the pre-validation visible ("3 eligible applicants, 7 filtered by AI") so the value is felt.
- **Opaque AI matching** — a match score without reasons is not actionable; show matched/missing skills and justification.
- **Tracking many tasks across projects** — needs a pipeline overview, not per-task page hopping.
- **Order limits surprising them at creation time** — show remaining monthly orders *before* they fill a form.

### Primary tasks (most frequent first)
1. Review incoming eligible applications (accept/reject).
2. Review submitted deliveries (approve / reject / request revision) and rate contributors.
3. Create and publish contribution requests.
4. Check AI match suggestions (Silver/Gold).
5. Import/publish/edit projects.
6. Manage plan and usage.

### Important decisions they make
- Accept or reject an eligible applicant (final human decision after AI gate — AI never auto-accepts **[Confirmed]**).
- Approve, reject, or request revision on a delivery — this creates reputation, so it must feel consequential.
- Task difficulty/requirements calibration (too strict = zero eligible applicants).
- Which plan tier to buy.

### Required information
- Applicant cards: verified skills vs. task requirements, AI justification, confidence, reputation, priority flag.
- Delivery review: PR link, contributor notes, task requirements side-by-side.
- Per-request pipeline counts (applications, eligible, accepted, delivered).
- Monthly order usage vs. plan limit.

### Trust concerns
- "Did the AI filter out someone good?" → show that ineligible applications existed (count) and that a `review_needed` path exists; never fabricate certainty.
- "Are ratings/reputation gameable?" → reputation is computed only from approved deliveries **[Confirmed]**; the UI should say so.

### Failure scenarios to design for
- Repo import fails (bad URL, rate limit, private repo) → actionable error at the import step.
- Task published, zero eligible applicants → suggest widening requirements or lowering difficulty; this is a calibration feedback loop **[UX-Required]**.
- Contributor never delivers → deadline display; cancel/reopen path (cancel is confirmed; reopen is **[Proposed]** — see state-model.md).
- Order limit reached mid-month → clear reset date + upgrade path.

---

## 3. Admin / Support

The platform's trust-and-safety operator. In the MVP this is the team itself; the PRD's OQ-001 leaves open whether this is a full dashboard or a lightweight tool — this design assumes a **focused dashboard covering the confirmed admin FRs only** (skill review, reports, disputes) and flags the rest as Future.

### Goals
- Review AI-generated skill profiles before they become active (FR-023, FR-030–FR-031).
- Correct AI assessments (adjust proficiency) with an audit trail (FR-024; `original_proficiency` preserved **[Confirmed]**).
- Resolve reports and disputes; prevent fraud and reputation manipulation (FR-025–FR-026).

### Motivations
- Platform credibility is the product. A bad approval poisons the reputation economy.
- Throughput: skill review is a queue job; every generated profile passes through them (potential bottleneck — see open-questions.md).

### Frustrations (design must address)
- **Reviewing without evidence**: approving "Python – Advanced" requires seeing the evidence summary and sources, not just the claim.
- **Repetitive queue work**: needs keyboard-friendly, batch-capable review UI with per-skill approve/adjust/reject in one screen.
- **Ambiguous cases**: low-confidence skills need a way to defer/flag, not a forced binary (ERD has no "needs clarification" state — proposed, see state-model.md).

### Primary tasks (most frequent first)
1. Work the pending skill-profile queue: inspect evidence → approve / adjust proficiency / reject per skill.
2. Resolve disputes (`skill_assessment` / `validation_decision` → uphold / overturn / dismiss).
3. Investigate reports (fraud, misuse, reputation manipulation, inaccurate AI, harassment).
4. User administration (role assignment **[Existing]**, suspend **[Confirmed — USER.status includes `suspended`]**).

### Important decisions they make
- Approve/adjust/reject each skill claim — directly controls who can apply to what.
- Overturn an AI validation decision (dispute) — overrides the core gate.
- Suspend a user or remove content.

### Required information
- Per skill: name, AI proficiency, confidence score, evidence summary, evidence sources (repos/files/commits), the contributor's GitHub link.
- Queue metadata: how long pending, contributor count blocked on review.
- For disputes: the original AI output, the contributor's reason and evidence, related history.

### Trust concerns
- Their own accountability: decisions must be logged (`reviewed_by`, `admin_notes`, `resolved_by` **[Confirmed]**) and visible in an audit trail.
- Consistency across admins → structured actions (enum outcomes) over free-text.

### Failure scenarios to design for
- Queue backlog grows → aging indicators, oldest-first default sort.
- Wrong decision made → correction path (re-review a reviewed profile) **[UX-Required]**; ERD supports re-generation to pending.
- Disputed decision requires re-running analysis → status feedback on re-profiling.

---

## Cross-role notes

- **Role exclusivity**: `USER.role` is a single enum — a user is contributor *or* owner, not both **[Confirmed]**. No role switching in MVP. (Flagged in open-questions.md: real developers are often both.)
- **Account activation gate**: contributors are not "fully active" for AI-gated applications until skill review completes (FR-014, FR-023). `USER.status` starts `pending` **[Confirmed]**. Owners have no equivalent gate — they can publish immediately after GitHub connect.
- **Bilingual**: `preferred_language: ar | en` with RTL support (NFR-004) applies to all roles and all screens.
- **Accessibility**: WCAG 2.1 AA (NFR-005) applies platform-wide.
