# Eligibility module

Renders the Phase 0 gate (DEC-078) on the contributor's side: whether they may
submit, and when they may not, exactly which skill fell short and what to do
about it.

**The block is never a rejection.** It is a "not yet, here is the path" state.
The panel carries no destructive colour, no `role="alert"`, and no language of
refusal — the contributor has not done anything wrong.

## Why it is its own module

Two features need it — the contributor task detail (`contribution-requests`)
and the proposal composer (`contribution-proposals`) — and modules never import
each other. The route composes it in, the same way `materialsSlot`,
`guidanceSlot` and `applicationQuotaSlot` already work.

## What the consuming view gets

It is handed a `ReactNode` and a boolean, never eligibility data. A view that
could read a verdict would eventually start deciding with it, and the decision
belongs to the backend.

## Accessibility

- The disabled submit control has an **accessible name that says why**, and
  `aria-describedby` pointing at the explanation. `disabled` alone announces
  "unavailable" without a reason, which is the dead end the feature exists to
  remove.
- Blocking skills are a real `<ul>` with a label, so the count and the
  boundaries between entries are announced.
- The `+`/`−` diff glyphs are `aria-hidden` and always paired with text.
  Nothing is carried by colour or symbol alone.
- The guidance region is `aria-live="polite"` and **never moves focus** — the
  contributor may be reading the list or tabbing to the recovery action when it
  resolves.
- Skill names and levels are `dir="ltr"` inside Arabic copy.

## The two ways a block reaches the screen

1. **Before the form** — `useContributionRequestEligibilityQuery` reads
   `GET /tasks/:id/eligibility`. Advisory by design; the backend recomputes
   inside the submission transaction and never trusts this answer.
2. **On submit (TOCTOU)** — eligibility changed after the page rendered, and
   the server refuses with `403 APPLICATION_BLOCKED_SKILL_GAP`.
   `readBlockingSkills` pulls the named skills out of the payload so the *same*
   explanation renders, not a generic error toast.

`readBlockingSkills` validates rather than casts: a malformed payload returns
`null` and the caller falls back to the generic error, instead of rendering a
half-built explanation with `undefined` where a level should be.

`EligibilityBlockPanel` requests guidance when it is given an
`eligibilityEvaluationId`:

- `GET /tasks/:id/eligibility` is a pre-flight that deliberately records no
  evaluation (`P0-B03`), so it has no id to return.
- The `403` refusal records one and returns it as
  `metadata.eligibilityEvaluationId`. The route validates that UUID and gives it
  to the panel, which requests the durable block-triggered guidance record.

The named skills remain the immediate explanation in both paths. Guidance is
an additional recovery path after a recorded refusal, never a condition for
rendering the deterministic reason.
