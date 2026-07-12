# 06 · AI match / decision explanation (shared pattern)

**Job**: one reusable explanation anatomy for *every* AI output in the product — validation decisions (contributor + owner views), owner match suggestions, skill assessments. Consistency is the trust mechanism: users learn to read one shape. [Confirmed data: AI_VALIDATION_RESULT / AI_MATCH_RESULT — decision, confidence, justification, matched/missing skills, source attribution.]

## The anatomy (`ExplanationCard`)

```
┌ ExplanationCard ───────────────────────────────────────────┐
│ ① VERDICT     ✓ Eligible          ② confidence ▓▓▓▓▓▓▓░ high│
│ ③ REASONING                                                │
│   "Sara's approved profile shows Intermediate Node.js from │
│   3 repos and REST API evidence. JWT-specific work absent  │
│   but auth-adjacent commits found in api-server."          │
│ ④ SKILLS                                                   │
│   matched:  Node.js ✓   REST APIs ✓                        │
│   missing:  JWT ✗                                          │
│ ⑤ EVIDENCE ▸  repo:api-server (commits) · repo:dashboard   │
│ ⑥ META & ACTIONS                                           │
│   AI recommendation — final decision is yours · [Dispute]  │
└────────────────────────────────────────────────────────────┘
```

Fixed rules:
- ① Verdict is plain language, never a bare score. ② Confidence is a labeled band (high/moderate/low) — decimals imply false precision; low confidence *says* "routed to human review" [Confirmed gate rule].
- ③ Reasoning is always visible (1–3 lines, expandable) — never hidden behind a click. ④ Skills use the same ✓/✗ grammar as the fit panel (WF-05).
- ⑤ Evidence links to real sources (attribution [Confirmed FR-088]). ⑥ Every card states whether a human decides next (Principle 3) and carries the dispute affordance where the viewer may dispute [Confirmed FR-059].

## Owner context — Matches tab (Silver/Gold)

```
│ AI-SUGGESTED CONTRIBUTORS (top 5 — Silver plan)   [How matching works]│
│ ┌ @sara-dev  ★4.8 · 18 tasks ── ExplanationCard(compact) ──────────┐ │
│ │ strong: Node.js, REST · gap: none · conf ▓▓▓▓▓▓ high             │ │
│ │ [View profile]  [Invite]  ← APPROVED (DEC-003): sends a          │ │
│ │   task_invitation; copy "Your verified skills appear to match     │ │
│ │   this contribution request…" — never "You have been selected."   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│ ┌ @omar-k … ┐  ┌ @lina-m … ┐                                          │
│ Bronze view: locked preview — real blurred-shape cards + copy         │
│ "AI matching finds the top contributors for this task — Silver (5)   │
│ / Gold (10). [Compare plans]" — honest, not dark-pattern.             │
```

## Owner context — application review
Same card embedded per applicant, verdict = "Passed validation ✓", plus the transparency line above the list: "12 applications · 4 passed AI validation" (the product's value made visible, [UX-Required]).

**States**: normal · low-confidence (→ human review notice) · evidence-unavailable ("no source attribution for this claim" — honesty over polish) · service-error (card-level retry; page unaffected).
**Mobile**: card full-width; evidence list collapses; skills wrap as chips.
**RTL**: verdict/confidence row mirrors; reasoning is localized text (RTL); skill tokens + repo names stay LTR.
