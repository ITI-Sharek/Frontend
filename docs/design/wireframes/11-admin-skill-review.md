# 11 · Admin skill review workspace (`/admin/skill-reviews/$userId`)

**Job**: high-throughput, evidence-grounded per-skill decisions. Every generated profile passes through here before a contributor can apply [Confirmed FR-014/023] — this screen's speed *is* the platform's activation latency. Desktop-first, keyboard-driven.

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Queue (7 waiting)   Reviewing: Sara Ahmed        [◀ prev] [next ▶]│
│ github.com/sara-dev ↗ · account 2y · 12 repos · waiting 2 days     │
├──────────────────────────────────────┬─────────────────────────────┤
│ GENERATED SKILLS (8)                 │ EVIDENCE — Python           │
│                                      │                             │
│ ▸ React  Intermediate  conf ▓▓▓▓ 0.78│ AI summary: "Advanced       │
│   ✓ approved                         │ patterns: async pipelines,  │
│ ▸ Node.js Advanced     conf ▓▓▓ 0.71 │ decorators, typing across   │
│   ✓ approved as Intermediate (edited)│ 4 repos; substantial commit │
│ ● Python  Advanced     conf ▓▓▓▓▓ .92│ history."                   │
│   [Approve] [Adjust ▾] [Reject]      │                             │
│ ○ Docker  Beginner     conf ▓▓ 0.65  │ SOURCES                     │
│ ○ GraphQL Intermediate conf ▓▓ 0.58  │ repo:ml-pipeline ↗          │
│   ⚠ low confidence                   │   142 commits · asyncio,    │
│ … 3 more                             │   type hints                │
│                                      │ repo:fastapi-app ↗          │
│ ────────────────────────────────     │   README: "production API…" │
│ progress: 3 of 8 decided             │ commits sample ↗            │
│ [Approve remaining 5] [Finish review]│                             │
└──────────────────────────────────────┴─────────────────────────────┘
```

**Interaction model**
- Left = decision list; right = evidence for the focused skill. Focus moves with J/K or click; A/E/R = approve/adjust/reject [UX-Required — queue throughput].
- **Adjust** opens inline level picker; saves with `original_proficiency` preserved [Confirmed] and shows "approved as X (AI said Y)".
- **Reject** requires a note (`admin_notes` [Confirmed]) — inline composer with reusable snippets ("insufficient evidence — single repo", …). Copy addressed *to the contributor*, who reads it verbatim.
- Low-confidence skills flagged ⚠ and sorted last — the AI's own uncertainty prioritizes admin attention.
- **Batch**: "Approve remaining" exists but is deliberately secondary/quiet (Principle 3 — reviewing must stay easier than rubber-stamping); confirm dialog lists what's being bulk-approved.
- **Finish review** → summary ("5 approved · 2 adjusted · 1 rejected") → confirm → contributor notified (`skill_review` [Confirmed]) → auto-advance next-in-queue.

**States**
- Partially reviewed: resumable; queue row shows "3/8".
- Re-generated profile (after contributor re-sync): **diff view** — unchanged/new/changed-level skills marked; previous decisions shown [UX-Required].
- Evidence unavailable/broken link: skill flagged "evidence unreachable" → reject-with-note or defer.
- Malformed AI output: quarantine banner — "regenerate profile" action; no guess-approving [Confirmed — no silent trust decisions].

**Queue page** (`/admin/skill-reviews`): oldest-first table (contributor · skills · avg conf · waiting). **SLA approved (DEC-011)**: target 48h (never described as guaranteed); aging bands <24h normal · 24–48h due soon · 48–72h overdue · >72h critical. Dashboard metrics: pending_count, oldest_pending_age, reviewed_today, median_review_time, overdue_count. Contributor-facing copy: "Most profile reviews are completed within 48 hours."
**Mobile**: fallback list with per-skill approve/adjust/reject; evidence links out. Full workspace flagged "best on desktop."
**RTL**: panes swap; evidence text may mix directions — skill/repo tokens LTR.
