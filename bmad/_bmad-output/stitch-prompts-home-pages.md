# Stitch Prompts — Share-k Home Pages (Contributor & Owner)

Brand identity extracted from `public/logo-1.png`, features from the PRD (FR-001…FR-094).
Each prompt below is **self-contained** — paste it into Stitch as-is, one screen per generation.

---

## Prompt 1 — Contributor Home Page

```
Design a web dashboard home page for "Share-k", an AI-powered open-source
collaboration platform, for the CONTRIBUTOR role (a developer who applies to
contribution tasks and builds a verified reputation).

BRAND IDENTITY (derived from the Share-k logo — two abstract human figures,
one deep indigo and one teal, interlocking and orbiting a shared center dot,
symbolizing partnership):
- Primary color: deep indigo #2E3192. Accent color: teal-mint #2BBFA4.
- Neutral palette: white surfaces, very light cool-gray page background
  (#F6F8FB), dark navy text (#1B1F3B).
- Use teal strictly for positive/AI/verified signals and primary CTAs;
  indigo for structure, navigation, and headings.
- Creative motif: echo the logo's interlocking-orbit shape — use large,
  soft circular/orbital background curves behind the hero area, pill-shaped
  chips, and fully rounded (16–20px radius) cards. Occasionally show two
  overlapping circles (indigo + teal, teal on top with slight transparency)
  as decorative accents and empty-state illustrations.
- Typography: modern geometric sans-serif (e.g., Inter or Manrope), bold
  navy headings, generous whitespace. Feel: trustworthy developer platform —
  GitHub-adjacent but warmer and more optimistic.
- Must look clean at WCAG AA contrast; design should tolerate RTL mirroring
  (Arabic support), so avoid direction-dependent decorations.

LAYOUT:
Left sidebar navigation (indigo-tinted, icons + labels): Home, Discover
Projects, Task Feed, My Applications, My Deliveries, Skill Profile,
Reputation, Notifications, Settings. Share-k logo at top of sidebar.
Top bar: global search input ("Search projects, tasks, technologies…"),
notification bell with unread badge, plan tier badge ("Gold" in a gold-tinted
pill), and user avatar with GitHub username (@ahmed-dev) and a small green
"GitHub connected" dot.

MAIN CONTENT (in order):

1. Welcome hero strip with orbital background curves: "Welcome back, Ahmed 👋".
   Below it a horizontal stat row of 4 compact stat cards (reputation
   snapshot): ⭐ Overall rating 4.8 · ✅ 18 completed contributions ·
   📈 94% success rate · 🕒 Applications today: 1 of 4 used (Gold plan daily
   limit) shown as a small progress ring in teal.

2. "Your Verified Skill Profile" card: a row of skill chips, each showing
   skill name + proficiency label, e.g. "Python — Advanced", "React —
   Intermediate", "Docker — Beginner". Verified chips have a teal check
   icon; one chip shows an amber "Pending admin review" state. A subtle
   link: "View full profile & evidence".

3. "AI-Recommended Tasks for You" section (Gold benefit) — highlighted with
   a soft teal gradient border and a small "AI" sparkle badge. Horizontal
   cards (3 visible), each card: task title (e.g. "Add JWT authentication"),
   parent project name, required tech chips (Node.js, JWT), difficulty
   badge (Intermediate — amber outline), deadline, optional reward
   ("$120 reward" in teal), match confidence "92% skill match" with a tiny
   teal progress bar, and an "Apply" primary button.

4. "Discover Projects" section: filter bar with dropdown pills — Technology
   stack, Category (Web Development, Mobile, AI/ML, DevOps, Tools &
   Utilities), Difficulty — plus a "Semantic search" toggle with AI sparkle
   icon. Below: a responsive grid of project cards (3 columns). Each project
   card: project avatar, title, one-line description, language/tech chips,
   difficulty badge, open-tasks count ("5 open tasks"), owner avatar, and a
   "View project" ghost button.

5. Right column (or lower section) — "My Active Applications" list with
   status timeline pills showing the pipeline states: "AI Validated ✓" (teal),
   "Awaiting owner review" (amber), "Accepted — in progress" (indigo),
   "Delivery submitted (PR linked)" (blue). Each row: task title, project,
   status pill, date.

6. One "Skill-Gap Guidance" card (Gold feature) shown for a rejected
   application: soft indigo background, message "You didn't meet the
   requirements for 'GraphQL API task' — here's your improvement path",
   listing 2 missing skills, a recommended learning resource link, and a
   suggested practice project, with a "View full guidance" button.

7. Small footer-area upsell banner using the two-overlapping-circles motif:
   "You're on Gold — enjoying AI recommendations & skill-gap coaching" (or
   an upgrade CTA variant).

Overall mood: energetic but professional; teal used sparingly so AI/verified
moments pop. Desktop web, 1440px, light theme.
```

---

## Prompt 2 — Owner Home Page

```
Design a web dashboard home page for "Share-k", an AI-powered open-source
collaboration platform, for the PROJECT OWNER role (a maintainer who
publishes GitHub projects, posts contribution tasks, and reviews
AI-prevalidated applicants).

BRAND IDENTITY (derived from the Share-k logo — two abstract human figures,
one deep indigo and one teal, interlocking and orbiting a shared center dot,
symbolizing partnership):
- Primary color: deep indigo #2E3192. Accent color: teal-mint #2BBFA4.
- Neutral palette: white surfaces, very light cool-gray page background
  (#F6F8FB), dark navy text (#1B1F3B).
- Teal is reserved for AI/verified/positive signals and primary CTAs;
  indigo for structure and headings.
- Creative motif: echo the logo's interlocking-orbit shape — soft circular
  orbital curves behind the hero, pill chips, 16–20px rounded cards, and
  decorative two-overlapping-circles (indigo + semi-transparent teal)
  accents. The owner page should feel like the indigo "half" of the brand
  (slightly more indigo-weighted than the contributor page).
- Typography: modern geometric sans-serif (Inter/Manrope), bold navy
  headings, generous whitespace. Trustworthy, GitHub-adjacent, warm.
- WCAG AA contrast; layout must tolerate RTL mirroring (Arabic support).

LAYOUT:
Left sidebar navigation (indigo-tinted, icons + labels): Home, My Projects,
Contribution Requests, Applicants, Deliveries, AI Matching, Notifications,
Settings. Share-k logo at top.
Top bar: search, notification bell with badge, plan tier badge ("Silver"
pill), user avatar with GitHub org name (@nova-labs) and green "GitHub
connected" dot.

MAIN CONTENT (in order):

1. Welcome hero strip with orbital curves: "Welcome back, Nova Labs".
   Primary CTA button (teal, prominent): "＋ Publish a Project" with helper
   text "Paste a GitHub repository URL — we'll fetch the metadata for you".
   Secondary button: "＋ Create Contribution Task".
   Beside it, a monthly quota card: "Contribution orders this month: 14 / 20
   (Silver plan)" with an indigo progress bar and a small "Upgrade to Gold"
   text link.

2. Stat row of 4 compact cards: 📁 3 published projects · 🧩 8 open tasks ·
   👥 12 AI-validated applicants awaiting review · 📬 2 deliveries to review.

3. "AI-Prevalidated Applicants" — the hero section of this page, framed with
   a soft teal gradient border and an "AI Validation Gate" sparkle badge and
   caption: "Only applicants who passed AI skill validation reach you."
   A list of 3 applicant rows, each: contributor avatar + name + reputation
   summary (⭐ 4.8 · 18 contributions · 94% success), applied-to task title,
   matched skill chips ("React — Advanced ✓", "Node.js — Intermediate ✓"),
   an AI confidence score shown as a teal radial gauge (e.g. 91%), an
   expandable one-line AI justification ("Strong evidence of JWT & Express
   experience across 6 repos"), and Accept (teal) / Reject (ghost) buttons.

4. "Deliveries Awaiting Review" card list: each row shows task title,
   contributor, a GitHub pull-request link chip (PR #42 with GitHub icon),
   submitted date, and a "Review delivery" button. One expanded example row
   shows the review actions: Approve / Reject buttons plus a 5-star rating
   selector and a feedback text field placeholder ("Leave feedback for the
   contributor…").

5. "My Projects" grid (3 cards): project title, auto-fetched description,
   language/tech chips, status badge (Published — teal / Draft metadata
   review — amber), stats (stars, open tasks count), and a "Manage" button.
   Include one dashed-border "empty" card with the two-overlapping-circles
   motif: "Publish your next project from a GitHub URL".

6. "Open Contribution Tasks" table-style list: task title, required tech
   chips, difficulty badge, deadline, optional reward, applicant count, and
   status (Open / Assigned / In delivery). Row example: "Add authentication
   using JWT — Intermediate — Node.js, JWT — due Jul 30 — $120 — 4 eligible
   applicants".

7. "Top AI-Matched Contributors" strip (Silver/Gold benefit) with sparkle
   badge: 5 small horizontal contributor cards — avatar, name, top verified
   skills, match % in teal — and an "Invite to task" ghost button on each.

Overall mood: command-center calm, indigo-forward, with teal highlighting
every AI-powered moment. Desktop web, 1440px, light theme.
```

---

## Notes for the team

- **One prompt = one screen** in Stitch; run them separately so each gets full fidelity.
- After generation, ask Stitch for a **mobile variant** and an **RTL/Arabic variant** as follow-up refinements rather than packing them into the first prompt.
- Colors sampled from `public/logo-1.png`: indigo ≈ `#2E3192`, teal ≈ `#2BBFA4`. Adjust in Figma export if the sampled values drift.
- Feature coverage traces to PRD FRs: contributor page covers FR-011→022, 040→045, 051→059, 066→072, 078→082; owner page covers FR-001→010, 034→039, 046→050, 060→065, 073→077.
