# 04 · Project details (`/projects/$projectId`)

**Job**: let a contributor answer two questions in order: "is this project healthy and interesting?" then "is there a task here I can win?" The open tasks are the conversion point — never below the fold on desktop.

```
┌────────────────────────────────────────────────────────────────────┐
│ ← Explore                                                          │
│ sharek-backend                       ((Published)) (Web) ((Interm.))│
│ NestJS API for open-source collaboration platform                  │
│ @karim (owner) · ★ 214 · ⑂ 31 · updated 3 days ago · [View on GitHub]│
├───────────────────────────────────┬────────────────────────────────┤
│ ABOUT                             │ OPEN TASKS (3)                 │
│ README-derived digest, owner-     │ ┌────────────────────────────┐ │
│ edited description. What the      │ │ Add JWT authentication     │ │
│ project does, contribution        │ │ Node.js·JWT ((Intermediate))│ │
│ expectations.                     │ │ due Jul 30 · $120          │ │
│                                   │ │ your fit: 2/3 ✓  [View →]  │ │
│ TECH                              │ ├────────────────────────────┤ │
│ TypeScript ▓▓▓▓▓▓▓░ 78%           │ │ Fix RTL layout issues      │ │
│ Python     ▓▓░░░░░░ 22%           │ │ React·CSS ((Beginner))     │ │
│ tags: nestjs·prisma·docker        │ │ your fit: 3/3 ✓✓ [View →]  │ │
│                                   │ ├────────────────────────────┤ │
│ OWNER                             │ │ + 1 more                   │ │
│ ┌ @karim · 4 projects            ││ └────────────────────────────┘ │
│ │ [View profile]                 ││                                │
│ └────────────────────────────────┘│ sidebar card sticks on scroll  │
└───────────────────────────────────┴────────────────────────────────┘
```

**Hierarchy**: identity/health header → (left) evaluation material → (right, sticky) conversion list. Fit hints on each task make the right rail personally ranked, not generic.

**Trust**: repo stats come straight from GitHub (labeled); "updated X ago" is the honesty signal for dead projects — do not hide staleness.

**States**
- Loading: header + two-column skeleton.
- Not found: 404 panel → [Explore projects].
- Archived: banner "No longer accepting contributions — history preserved"; task list read-only.
- No open tasks: right rail = "No open tasks right now. ((Notify me [Proposed])) · similar projects →".
- Unauthenticated: fit hints replaced by "Join to see your fit"; tasks fully readable [per OQ-D2].

**Actions**: primary = open task; secondary = GitHub link, owner profile, report (overflow menu).

**Mobile**: single column — header → sticky bottom bar "[View open tasks (3)]" → about → tech → tasks anchor.
**RTL**: two columns swap; language bars fill right→left; repo/tech tokens LTR.
