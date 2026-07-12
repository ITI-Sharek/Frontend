# Share-k — Product Experience Principles (Step 2)

Eight principles that govern every Share-k design decision. Each is grounded in a locked PRD requirement, and each comes with a concrete good/bad UI example so it can be enforced in reviews, not just admired.

---

## 1. Evidence over declaration

**Explanation.** Share-k's entire value is that skills, reputation, and eligibility are derived from verifiable evidence (GitHub activity, approved deliveries, owner ratings) — never from self-description. The UI must always show *where a claim comes from* and visually rank evidence-backed information above declared information. (FR-029, FR-033, FR-071, ERD `evidence_sources`.)

**Good UI.** A skill chip reads "React — Intermediate ✓ Verified" and expands to show "Evidence: dashboard-ui (34 commits), portfolio-app (README, package.json) — reviewed by admin on Mar 3."

**Bad UI.** A skills section where AI-verified skills and a user-typed "skills I know" list render as identical tags, letting a visitor assume both are verified.

---

## 2. Explainable AI, always

**Explanation.** Every AI output surfaced to a user — eligibility decision, match score, skill assessment, gap guidance — must carry its justification, confidence, and evidence attribution (NFR-003, FR-053, FR-088). A number without a reason is not allowed anywhere in the product. Confidence below threshold routes to human review, and the UI must say so rather than pretending certainty.

**Good UI.** "Not eligible for this task. Why: requires JWT (Advanced) — your verified profile shows no authentication-related evidence. Matched: Node.js ✓, REST APIs ✓. Missing: JWT, OAuth 2.0. [Dispute this decision]"

**Bad UI.** A red banner: "Application rejected by AI." Or a match card showing only "87% match" with no expandable reasoning.

---

## 3. Humans decide, AI recommends

**Explanation.** AI gates and ranks, but a human always makes the consequential call: admins approve skills before they count (FR-014), owners accept applications and approve deliveries (FR-006, FR-008). The UI must make the human-decision moments feel deliberate and authoritative, and must never phrase AI output as a final verdict where a human step remains.

**Good UI.** Owner application card: "AI pre-validated ✓ (confidence 0.91) — your decision:" followed by Accept / Reject buttons and the justification underneath.

**Bad UI.** "Contributor auto-matched and assigned to your task." Or an admin queue with a bulk "Approve all" as the primary CTA, making rubber-stamping easier than reviewing.

---

## 4. Status is never silent

**Explanation.** Share-k is full of asynchronous waits: GitHub ingestion, AI analysis, admin review, owner review, delivery review. Every wait state must show *where the user is*, *what happens next*, *who acts next*, and — when knowable — *roughly how long*. Recovery actions (retry, dispute, withdraw) live on the status itself. (FR-064; ERD status enums for every workflow entity.)

**Good UI.** A pipeline strip on the application page: Applied ✓ → AI validation ✓ Eligible → **Owner review (you're here — owners typically respond in ~2 days)** → Delivery → Completed.

**Bad UI.** An application row that just says "Pending" for a week with no indication whether AI, owner, or the platform is the blocker.

---

## 5. Rejection is a next step, not a wall

**Explanation.** Rejection is a core, *designed* moment in Share-k: the AI gate blocks ineligible applications by design (FR-018–FR-019), and Gold members get structured gap guidance (FR-057). Every rejection screen must state the honest reason and offer at least one forward action: what to learn, what to dispute, or which easier task fits today. Never use rejection screens to shame, and never hide the reason to upsell.

**Good UI.** "You don't meet this task's requirements yet. Missing: Docker. You *do* qualify for 4 similar tasks without Docker → [View them]. Gold members get a personalized learning path here → [See what's included]."

**Bad UI.** "Application blocked." with only an "Upgrade to Gold" button — burying the reason behind a paywall breaks FR-019 (the explanation itself is not a premium feature; the *guidance* is).

---

## 6. Speak developer, in both languages

**Explanation.** The audience is developers on both ends. Use precise technical vocabulary (PR, repo, commit, stack), real entity names, and honest system language — and deliver it equally well in Arabic and English with correct RTL behavior (NFR-004, `preferred_language`). Marketing hyperbole ("revolutionary", "unleash") is banned. Technical tokens (repo names, code, skill names) stay LTR inside RTL text.

**Good UI.** "Submit the PR URL for `sharek-backend#142`. We'll notify @sara-dev (owner) to review it." — rendered RTL in Arabic with the PR reference kept LTR and monospaced.

**Bad UI.** "🚀 Supercharge your coding journey!" — or an Arabic layout that mirrors the text but leaves the progress stepper, breadcrumbs, and directional icons pointing the wrong way.

---

## 7. Limits are visible before the act

**Explanation.** Plan limits (orders/month, applications/day) and premium gating (matching, guidance, priority) are core business rules (FR-073–FR-082). The user must always see their remaining quota *before* starting a gated action, and tier-locked features must be visibly labeled with what tier unlocks them — no surprise walls after a filled form, no invisible premium features nobody discovers.

**Good UI.** The Apply button area reads "Apply (1 of 2 today remaining)". The matching panel for a Bronze owner shows a real preview frame: "AI contributor matching — available on Silver (top 5) and Gold (top 10). [Compare plans]".

**Bad UI.** Contributor fills a cover message, hits Apply, and only then gets "Daily limit reached." Or premium matching simply absent from Bronze owners' UI, so they never learn it exists.

---

## 8. Progress is the product

**Explanation.** For contributors, Share-k is a growth loop: analyze → verify → contribute → reputation → better matches. The UI should make accumulation visible — verified skills gained, tasks completed, rating trend, gaps closed — so returning users see movement, and empty states show the *path*, not a void. This is what separates "trusted growth infrastructure" from "job board." (FR-021, FR-066–FR-072.)

**Good UI.** Dashboard header: "2 skills verified this month · 3 tasks completed · rating 4.6 → 4.8". Empty reputation state: "Your reputation builds from approved contributions. Step 1: get your skill profile approved (in review, ~1 day) → Step 2: apply to a matched task."

**Bad UI.** A dashboard of static lifetime totals with no deltas, and an empty state that says "No reputation data."

---

## How to apply these

In every design review, each screen should be checked with: *Which principle does this element serve? Which principle does it violate?* Principles 2, 4, and 5 are the most frequently violated in AI products — treat them as blocking review criteria, not aspirations. Principle 6 (bilingual) is structural: every wireframe in `wireframes/` carries an RTL note; a screen that only works LTR is an incomplete screen.
