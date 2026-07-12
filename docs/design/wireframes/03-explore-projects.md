# 03 · Explore projects (`/explore`)

**Job**: scannable, comparable project cards; filters that map to confirmed backend fields (tech / category / difficulty [Confirmed FR-041–044]) + semantic search (FR-045).

```
┌────────────────────────────────────────────────────────────────────┐
│ Explore projects                                                   │
│ ┌──────────────────────────────────────────────┐                   │
│ │ 🔍 Try "realtime chat in Go" — search understands meaning        │
│ └──────────────────────────────────────────────┘                   │
├──────────────┬─────────────────────────────────────────────────────┤
│ FILTERS      │ 42 projects · sorted by newest ▾                    │
│              │                                                     │
│ Technology   │ ┌─────────────────────────────────────────────────┐ │
│ ☑ React      │ │ sharek-backend        ((Intermediate)) (Web)    │ │
│ ☐ Node.js    │ │ NestJS API for open-source collaboration…       │ │
│ ☐ Python     │ │ TypeScript ▓▓▓▓▓▓░░ 78% · Docker · Postgres     │ │
│ + more       │ │ ★ 214 · 3 open tasks · @karim  [fit: 2/3 skills]│ │
│              │ └─────────────────────────────────────────────────┘ │
│ Category     │ ┌─────────────────────────────────────────────────┐ │
│ ○ All        │ │ arabic-nlp-toolkit      ((Advanced)) (AI/ML)    │ │
│ ○ Web        │ │ …                                               │ │
│ ○ AI/ML …    │ └─────────────────────────────────────────────────┘ │
│              │ ┌ card ┐ ┌ card ┐ …                                 │
│ Difficulty   │                                                     │
│ ○ Beginner…  │              [Load more]                            │
│              │                                                     │
│ [Reset]      │                                                     │
└──────────────┴─────────────────────────────────────────────────────┘
```

**Card anatomy (fixed order, scannable)**: name → difficulty + category chips → 1-line description → language bar + top tech tags → repo stats · open-task count · owner → personal fit hint (authed only, [UX-Required]).
Cards are deliberately uniform (comparison surface) — the *feed* is not the place for varied visual weight; featured treatments belong on Home.

**Decision support**: open-task count answers "can I contribute *now*"; fit hint answers "should *I* open this". Both push good clicks and reduce doomed applications.

**States**
- Loading: 6 skeleton cards, filters interactive immediately.
- Filtered-empty: "Nothing matches React + Beginner + AI/ML" → chips shown, one-tap removal, [Reset].
- Semantic search active: result header says "matching meaning of '…'"; exact-filter chips still apply.
- Unauthenticated: no fit hints; inline strip after card 6: "Join to see which projects match your verified skills."
- Error: retry panel in results column only.

**URL**: all filters/search/sort in search params (shareable, back-navigable — TanStack Router search params).

**Mobile**: filter sidebar → [Filters (2)] button → bottom sheet; cards single column; search stays on top.
**RTL**: filters flip to the right; language bar fills right→left; tech tags/repo names LTR inside RTL text.
