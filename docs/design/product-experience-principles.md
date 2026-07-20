# Share-k — Product Experience Principles (Step 2)

Eight principles that govern every Share-k design decision. Each is grounded in a locked PRD requirement, and each comes with a concrete good/bad UI example so it can be enforced in reviews, not just admired.

---

## 1. Evidence over declaration

**Explanation.** Share-k's entire value is that reviewed skills, reputation, contribution records, and fit explanations are grounded in evidence rather than self-description. Evidence may come from explicitly authorized repositories, owner attestation, attachments, descriptions, screenshots, demo links, or repository-free work where approved contracts support it. The UI always shows where a claim comes from and visually ranks reviewed evidence above declaration. (DEC-030–DEC-033.)

**Good UI.** A skill chip reads "React — Intermediate · Reviewed" and expands to show source, verification method, visibility, freshness, review state, confidence, and uncertainty without exposing private source details to an unauthorized viewer.

**Bad UI.** A skills section where AI-verified skills and a user-typed "skills I know" list render as identical tags, letting a visitor assume both are verified.

---

## 2. Explainable AI, always

**Explanation.** Every AI output surfaced to a user—fit assessment, recommendation, skill assessment, or evidence summary—carries plain-language reasoning, confidence, uncertainty, and audience-safe evidence attribution. A number without a reason is forbidden. AI fit is advisory and never prevents an application solely because of its conclusion; the project owner decides whom to select. (DEC-030, DEC-033.)

**Good UI.** "Limited fit. Supporting evidence: reviewed Node.js and REST API work. Missing evidence: recent JWT or OAuth work. Confidence: moderate because one supporting source is private and cannot be shown here. You may still apply; the project owner makes the final decision."

**Bad UI.** A red banner saying the AI rejected the application, or a match card showing only "87%" with no reasoning, uncertainty, or human decision path.

---

## 3. Humans decide, AI recommends

**Explanation.** AI organizes and explains evidence, but a human makes the consequential call: project owners select contributors and review completed work, while admins handle account-level review and moderation where supported. The UI makes human-decision moments deliberate and never presents AI fit as a final verdict.

**Good UI.** Owner application card: "AI-assisted fit: Partial · confidence: moderate · supporting and missing evidence" followed by the owner's selection actions and the explanation.

**Bad UI.** "Contributor auto-matched and assigned to your task." Or an admin queue with a bulk "Approve all" as the primary CTA, making rubber-stamping easier than reviewing.

---

## 4. Status is never silent

**Explanation.** Share-k is full of asynchronous waits: evidence synchronization, AI analysis, admin review, owner decision, and contribution review. Every wait state shows where the user is, what happens next, who acts next, and the available recovery action. Expected timing appears only when the backend supplies a reliable value or the product has an approved service expectation.

**Good UI.** A pipeline strip on the application page: Applied ✓ → Fit explanation available ✓ → **Awaiting owner decision (you are here)** → Collaboration → Evidence submitted → Reviewed.

**Bad UI.** An application row that just says "Pending" for a week with no indication whether AI, owner, or the platform is the blocker.

---

## 5. Every outcome provides a next step

**Explanation.** Owner decisions, limited-fit assessments, evidence requests, revisions, and terminal states are designed moments. Every outcome states the current state and, where supported, offers a forward action: inspect evidence, improve the application, choose another task, revise work, dispute a factual error, or understand why access ended. Never use an outcome to shame or upsell.

**Good UI.** "Fit appears limited because no reviewed Docker evidence is available. You can still apply and explain related experience; the owner decides. Prefer a stronger fit? View tasks supported by your reviewed React and Node.js work."

**Bad UI.** "Application blocked by AI," a dead-end owner decision, or any outcome that hides its reason behind a plan or upgrade prompt.

---

## 6. Speak developer, in both languages

**Explanation.** The audience is developers on both ends. Use precise technical vocabulary (PR, repo, commit, stack), real entity names, and honest system language — and deliver it equally well in Arabic and English with correct RTL behavior (NFR-004, `preferred_language`). Marketing hyperbole ("revolutionary", "unleash") is banned. Technical tokens (repo names, code, skill names) stay LTR inside RTL text.

**Good UI.** "Submit the PR URL for `sharek-backend#142`. We'll notify @sara-dev (owner) to review it." — rendered RTL in Arabic with the PR reference kept LTR and monospaced.

**Bad UI.** "🚀 Supercharge your coding journey!" — or an Arabic layout that mirrors the text but leaves the progress stepper, breadcrumbs, and directional icons pointing the wrong way.

---

## 7. Real constraints are visible before the act

**Explanation.** A contributor sees every real, contract-supported restriction before starting an action: a closed task, duplicate application, missing permission, terminal state, unavailable private workspace, unsupported file type, or another explicit backend rule. Legacy contributor daily attempts and plan restrictions are not part of the current experience. (DEC-031, DEC-035.)

**Good UI.** A closed task replaces Apply with "Applications are closed" and a link back to suitable work. An applicant sees their application but cannot enter the accepted contributor's private workspace.

**Bad UI.** A contributor fills a cover message and only then learns the task is closed, or an applicant sees a private collaboration control that the backend will reject.

---

## 8. Progress is the product

**Explanation.** For contributors, Share-k is a growth loop: analyze → verify → contribute → reputation → better matches. The UI should make accumulation visible — verified skills gained, tasks completed, rating trend, gaps closed — so returning users see movement, and empty states show the *path*, not a void. This is what separates "trusted growth infrastructure" from "job board." (FR-021, FR-066–FR-072.)

**Good UI.** Dashboard header: "2 skills reviewed this month · 3 contributions completed · rating 4.6 → 4.8". Empty record state: "Your contribution record grows from completed and reviewed work. Start by exploring tasks and comparing their requirements with your evidence."

**Bad UI.** A dashboard of static lifetime totals with no deltas, and an empty state that says "No reputation data."

---

## How to apply these

In every design review, each screen should be checked with: *Which principle does this element serve? Which principle does it violate?* Principles 2, 4, and 5 are the most frequently violated in AI products — treat them as blocking review criteria, not aspirations. Principle 6 (bilingual) is structural: every wireframe in `wireframes/` carries an RTL note; a screen that only works LTR is an incomplete screen.
