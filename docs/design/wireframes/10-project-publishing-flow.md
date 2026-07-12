# 10 · Project publishing flow (`/my-projects/new`)

**Job**: repo → published project in three steps, with the owner always in control of what goes live [Confirmed FR-003/036: nothing publishes without explicit confirmation]. Draft persists at every step [Confirmed — PROJECT.status draft].

```
 ● Pick repository ──── ○ Review details ──── ○ Publish
```

## Step 1 — Pick repository

```
┌────────────────────────────────────────────────────────────────────┐
│ Which repository?                    🔍 filter repos               │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ◉ sharek-backend        TypeScript · ★214 · updated 3d ago     │ │
│ │ ○ arabic-nlp-toolkit    Python · ★89 · updated 2w ago          │ │
│ │ ○ dotfiles              Shell · ★2 · updated 1y ago            │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ Can't see it? Paste owner/repo: [___________]  (public repos only) │
│                                              [Import this repo →]  │
└────────────────────────────────────────────────────────────────────┘
```
List from `GET /github/repositories` [Existing]; paste fallback covers org repos [Existing endpoint takes `fullName`]. Import runs with staged feedback ("fetching metadata · README · languages…").
**Failures (distinct, actionable)**: not found ("check owner/repo") · private/no-access · rate-limited ("try in ~1 min") · **already on Share-k** (unique repo URL [Confirmed]: "imported by another owner — contact support if this is your repo").

## Step 2 — Review details (draft exists from here)

```
┌────────────────────────────────────────────────────────────────────┐
│ Review before publishing — fetched from GitHub, all editable       │
│ Title        [sharek-backend            ]  ⓘ from GitHub          │
│ Description  [NestJS API for open-source…]  ⓘ from GitHub          │
│ Tags         [nestjs ×][prisma ×][+ add]    ⓘ detected             │
│ Languages    TypeScript 78% · Python 22%    (read-only, synced)    │
│ ── you choose (drives discovery & matching) ──────────────────     │
│ Category *   ( Web ▾ )       ⓘ filter contributors browse by      │
│ Difficulty * ( Intermediate ▾ ) ⓘ sets contributor expectations   │
│                                   [Save draft]  [Continue →]       │
└────────────────────────────────────────────────────────────────────┘
```
Fetched vs. owner-chosen fields are visually separated — the owner's two *decisions* (category, difficulty) get the emphasis and consequence help-text; everything else is verification.

## Step 3 — Publish

```
│ Publish sharek-backend?                                            │
│ ✓ visible to all contributors in Explore                           │
│ ✓ indexed for semantic search [FR-038]                             │
│ ✓ you can then create contribution requests                        │
│ (you can archive anytime — history is preserved)                   │
│                                   [Keep as draft]   [Publish 🚀]   │
│ Success → "Live!" → primary next step: [Create first request]     │
│                                        [View public page]         │
```

**States across flow**: repos loading/empty · importing · import-failed (4 causes) · draft-saved (resumable from `/my-projects`) · publishing · published-success.
**Abandonment**: leaving mid-flow keeps the draft; `/my-projects` shows "((Draft)) — finish publishing →".
**Mobile**: steps full-screen; repo list searchable; consequence checklist unchanged.
**RTL**: stepper mirrors; form labels right-aligned; repo names/tags LTR.
