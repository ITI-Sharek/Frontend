# 02 · Contributor dashboard (`/dashboard`)

> **Correction (DEC-030–DEC-035):** quota and AI-gate content in this historical wireframe is superseded. Dashboard implementation is deferred until its real read model exists; see `../contributor-implementation-readiness.md`.

**Job**: answer "what needs me, and what should I do next?" — actions outrank metrics. Layout re-composes by lifecycle state.

## State A — active contributor (steady state)

```
┌ sidebar ─┐┌────────────────────────────────────────────────────────┐
│ Dashboard││ Good morning, Sara            🔔(2)  (avatar)          │
│ Explore  ││                                                        │
│ Tasks    ││ NEEDS YOUR ATTENTION                                   │
│ Apps (1) ││ ┌────────────────────────────────────────────────────┐ │
│ Skills   ││ │ ⚠ Changes requested on "Add JWT auth" delivery     │ │
│          ││ │   owner feedback attached          [Open & revise] │ │
│ Settings ││ ├────────────────────────────────────────────────────┤ │
│──────────││ │ ✓ You were accepted for "Fix RTL layout"           │ │
│ Bronze   ││ │   deadline in 6 days               [Submit PR →]   │ │
│ 1/2 apps ││ └────────────────────────────────────────────────────┘ │
│ today    ││                                                        │
└──────────┘│ MATCHED TASKS (why: your verified React + Node)  [→]   │
            │ ┌task card──┐ ┌task card──┐ ┌task card──┐              │
            │ │fit 3/3 ✓  │ │fit 2/3    │ │fit 3/3 ✓  │              │
            │ └───────────┘ └───────────┘ └───────────┘              │
            │                                                        │
            │ YOUR GROWTH                          MY APPLICATIONS   │
            │ rating 4.6 → 4.8 ▲                   eligible: 1       │
            │ 6 completed · 92% success            waiting owner: 1  │
            │ +2 skills verified this month        [View all]        │
            └────────────────────────────────────────────────────────┘
```

## State B — onboarding incomplete (dashboard *is* the checklist)

```
│ Finish setting up (2 of 4 done)                                    │
│ ✓ Account created                                                  │
│ ✓ GitHub connected                                                 │
│ ● Analysis in progress… (~2 min) — we'll notify you                │
│ ○ Admin review — after analysis                                    │
│ Meanwhile: [Explore projects] (applying unlocks after review)      │
```

## State C — approved but zero applications
Hero: "You're verified. 5 tasks fully match your skills today → [See them]". Growth panel shows the path (Principle 8), not zeros.

**Hierarchy**: attention feed (amber) > matched tasks > growth/applications summary. Quota lives permanently in the sidebar footer.
**Decision support**: every matched task shows fit-count and *why matched*; attention cards carry their one action inline.
**States**: A/B/C above + limit-reached (quota meter goes amber, apply CTAs explain reset time) + error per panel (isolated panel-level retry, never a blank page).
**Mobile**: order = attention → quota chip → matched tasks (horizontal scroll) → growth. Bottom tabs replace sidebar.
**RTL**: deltas and meters mirror; ✓/⚠ lead on the right edge.
