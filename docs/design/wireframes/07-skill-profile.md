# 07 · Contributor skill profile (`/skills`, own view)

**Job**: show the contributor exactly what the platform believes about them, with what evidence, in which review state — and give them the two levers: re-analyze and dispute. Trust hinges on this page never blurring the line between AI-claimed, admin-verified, and rejected.

```
┌────────────────────────────────────────────────────────────────────┐
│ My skills                                                          │
│ ┌ GITHUB ──────────────────────────────────────────────────────┐  │
│ │ ⚡ github.com/sara-dev · connected · last analyzed Jul 2       │  │
│ │ 4 new repos since analysis → [Re-analyze]                     │  │
│ │ ⓘ re-analysis regenerates skills; they re-enter admin review  │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ((5 verified))  ((2 in review))  ((1 not verified))  ((1 disputed))│
│                                                                    │
│ SKILL              LEVEL          STATUS          EVIDENCE         │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ React        Intermediate    ✓ Verified        3 sources ▸    │ │
│ │ Node.js      Intermediate*   ✓ Verified        2 sources ▸    │ │
│ │   * adjusted by admin (AI said: Advanced) — note ▸            │ │
│ │ Python       Advanced        🕐 In review       4 sources ▸    │ │
│ │ Docker       Beginner        ✗ Not verified    1 source ▸     │ │
│ │   └ admin note: "single Dockerfile, no orchestration evidence"│ │
│ │     [Dispute]  [How to strengthen this ▸]                     │ │
│ │ GraphQL      Intermediate    ⚖ Under dispute   — opened Jul 8 │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ Evidence row (expanded): repo:dashboard-ui — 34 commits, hooks/    │
│ context usage · repo:portfolio — package.json, components …       │
└────────────────────────────────────────────────────────────────────┘
```

**Hierarchy**: GitHub/analysis card (the input) → status summary chips (filter on tap) → the skills table (the substance). Reputation does *not* live here — it belongs to the public profile; a footer link points there.

**Key honesty details**
- Admin adjustments always disclose the original AI level (`original_proficiency` [Confirmed]) — hiding the correction would undermine the "human review" trust story.
- Rejected skills show the admin's note verbatim (`admin_notes` [Confirmed]) + the two forward paths: dispute [Confirmed FR-059] or strengthen-and-re-analyze (guidance content [UX-Required]).
- Disputed rows are visibly frozen ("doesn't count while dispute is open" [Confirmed]).

**States**
- All-pending (first review): table shows all 🕐 + banner "Your profile is with our review team — we'll notify you."
- Re-analysis running: GitHub card becomes progress (see WF-08); table dims with "updating" notice; old skills remain visible until replaced.
- GitHub disconnected: table intact + banner "reconnect to re-analyze."
- Empty (analysis found nothing): honest guidance — "we couldn't extract skills from public activity; add public repos, then re-analyze."

**Actions**: Re-analyze (primary, only when meaningful) · per-skill: evidence expand, dispute (rejected/inaccurate), strengthen-guide.
**Mobile**: table → stacked skill cards (name+level+status on top line, evidence collapsible).
**RTL**: table mirrors (skill column right); skill names/repos LTR; status chips right-aligned.
