# 12 · Ineligible application + skill-gap guidance

**Job**: the product's hardest moment. The AI just blocked the user's application [Confirmed FR-055–056]. This screen must (1) explain honestly, (2) hand back momentum, (3) deliver Gold guidance [Confirmed FR-057] — and for non-Gold, show the reason in full while presenting Gold fairly (the *reason* is never paywalled; the *plan* is the premium).

## Outcome view (all tiers) — shown after validation, persisted on application detail

```
┌────────────────────────────────────────────────────────────────────┐
│  You're not eligible for this task yet.                            │
│                                                                    │
│  ┌ ExplanationCard (WF-06) ─────────────────────────────────────┐  │
│  │ ✗ Not eligible          confidence ▓▓▓▓▓▓ high               │  │
│  │ "This task needs JWT and OAuth 2.0 experience. Your verified │  │
│  │  profile shows strong Node.js and REST work, but no          │  │
│  │  authentication-related evidence."                           │  │
│  │ matched: Node.js ✓ · REST APIs ✓     missing: JWT ✗ OAuth ✗  │  │
│  │ evidence ▸        [Dispute this decision]                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  WHAT NOW                                                          │
│  ① 4 open tasks fully match your verified skills   [See them →]   │
│  ② Close the gap — learn JWT/OAuth, then re-analyze your profile  │
│  ③ Think this is wrong? [Open a dispute]                          │
│                                                                    │
│  ⓘ This application used 1 of today's attempts (1 remaining).     │
│    [Resolved — DEC-006: quota is consumed when validation starts, │
│     including ineligible outcomes; refunded only on technical     │
│     failure. Copy above reflects the decided policy.]             │
└────────────────────────────────────────────────────────────────────┘
```

Tone rules: verdict says "yet"; the first WHAT-NOW item is a *win available today* (redirect momentum, Principle 5); dispute sits on the card itself [Confirmed FR-059].

## Gold addition — skill-gap guidance panel (streams in below)

```
│  YOUR GAP PLAN (Gold) ✦                                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Missing skills      JWT · OAuth 2.0                           │ │
│  │ Learn with          jsonwebtoken · passport.js                │ │
│  │ Resources           JWT.io intro ↗ · Auth0 Node tutorial ↗    │ │
│  │ Practice            build a token-auth REST API (spec ▸)      │ │
│  │ Estimated path      ~2–3 weeks                                │ │
│  │ (narrative streams here as it generates…)          [sources ▸]│ │
│  └───────────────────────────────────────────────────────────────┘ │
│  Saved to this application — find it anytime in My applications.   │
│  When you've practiced: [Re-analyze my profile]  → closes the loop │
```

Structured fields render first (missing skills → resources → practice → timeline [Confirmed — SKILL_GAP_GUIDANCE fields]); the narrative streams [Confirmed FR-085]. Generation failure: structured fallback from validation's `missing_skills` + [Retry] — guidance failing never blocks the outcome view.

## Non-Gold variant of the panel slot
```
│  ✦ Gold members get a personalized learning plan here: exact       │
│    missing skills, curated resources, practice projects, timeline. │
│    Your plan: Bronze · [See what Gold includes]                    │
```
Honest preview of the *shape* (no fake blurred content pretending to exist). Never repeats the reason inside the upsell — reason already delivered above.

**States**: outcome (all tiers) · Gold streaming · Gold complete (persisted) · guidance failed (fallback) · dispute opened (card shows "dispute open — this decision is under human review" [Confirmed]).
**Mobile**: single column; WHAT-NOW items become full-width buttons; streaming panel collapses to expandable after first view.
**RTL**: card mirrors; Arabic narrative RTL with tech tokens (JWT, passport.js) LTR; timeline reads right→left.
