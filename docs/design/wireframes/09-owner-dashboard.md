# 09 · Project-owner dashboard (`/dashboard`, owner)

**Job**: an inbox, not a stats page. Owners come to *decide things*: applications waiting, deliveries waiting. Contributors are blocked on these decisions — waiting time is surfaced as gentle pressure.

```
┌ sidebar ──┐┌───────────────────────────────────────────────────────┐
│ Dashboard ││ sharek dashboards                    🔔(3)  (avatar)  │
│ Projects  ││                                                       │
│           ││ NEEDS YOUR DECISION (section name approved — DEC-009) │
│ Settings  ││ ┌───────────────────────────────────────────────────┐ │
│───────────││ │ 📦 Delivery for "Add JWT auth" — @sara-dev        │ │
│ Silver    ││ │    submitted 2 days ago · contributor is waiting  │ │
│ 14/20     ││ │                                  [Review delivery]│ │
│ orders    ││ ├───────────────────────────────────────────────────┤ │
│ this month││ │ 👤 2 eligible applications — "Fix RTL layout"     │ │
└───────────┘│ │    oldest waiting 3 days          [Review (2)]    │ │
             │ └───────────────────────────────────────────────────┘ │
             │                                                       │
             │ AI MATCHES (Silver: top 5)                       [→]  │
             │ "Add JWT auth": 3 strong matches found — invite or    │
             │ wait for applications  [See matches]                  │
             │                                                       │
             │ MY PROJECTS                          [+ Import project]│
             │ ┌───────────────────────────────────────────────────┐ │
             │ │ sharek-backend ((Published)) 3 open·2 apps·1 deliv│ │
             │ │ arabic-nlp     ((Draft)) — finish publishing →    │ │
             │ └───────────────────────────────────────────────────┘ │
             │                                                       │
             │ THIS MONTH: 14/20 orders ▓▓▓▓▓▓▓░░░ · 6 remaining     │
             └───────────────────────────────────────────────────────┘
```

**Hierarchy**: decisions (amber, aged) → premium matches (the paid value, kept visible) → portfolio → quota. Deliveries outrank applications: an accepted contributor waiting on review is the platform's most painful wait.

**Decision support**: every attention card carries who/what/how-long + a single verb. Aging ("waiting 3 days") is the prioritization signal — no scores, no charts.

**States**
- No projects: page becomes the import hero — "Publish your first project" + 3-step preview (pick repo → review metadata → publish) [mirrors WF-10].
- Projects but no requests: "Your project is live. Create the first contribution request → contributors can't apply to nothing."
- Nothing pending: decisions panel = "All caught up ✓ · 2 tasks open for applications" (calm, not empty).
- Order limit reached: quota strip amber — "20/20 used · resets Aug 1 · Gold = 30/mo" (Principle 7; upgrade shown, not shoved).
- Bronze variant: AI-matches panel = honest locked preview (see WF-06).

**Mobile**: decisions feed first, full-width; projects list collapses to chips; quota chip pinned in header. Bottom tabs per navigation-model.
**RTL**: full mirror; meters fill right→left; repo names LTR.
