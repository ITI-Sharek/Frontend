# Share-k — Navigation Models (Step 4)

> Four distinct navigation systems — one per audience. They deliberately do **not** share one structure: the public site sells, the contributor app is a personal workspace, the owner app is a review pipeline, the admin app is a queue processor.
> RTL note: every model must mirror fully in Arabic — sidebar position, chevrons, breadcrumb separators, stepper direction, badge placement. Directional icons flip; technical tokens (repo names, code) stay LTR.

---

## 1. Public visitors

**Pattern**: top navbar, marketing shell (`_publicLayout`). No sidebar.

| Slot | Content |
|---|---|
| Left (RTL: right) | Share-k logo → `/` |
| Center | Explore · How It Works (anchor → home section) · Plans |
| Right (RTL: left) | Language toggle (ar/en) · Sign In (ghost) · **Join Share-k** (filled, primary) |

*(Labels per DEC-007/OQ-D2: Explore · How It Works · Plans · Sign In · Join Share-k.)*

- **Mobile**: logo + hamburger → full-screen sheet listing the same items; "Get started" pinned at sheet bottom. No gimmick navs — keyboard- and screen-reader-clean.
- **Search**: none in public nav for MVP; `/explore` has its own search. A global omnisearch is [Future].
- **Breadcrumbs**: none on marketing pages; `/projects/$projectId` gets a simple "← Explore" back link (visitors arrive from feed or external links).
- **Authenticated visitor** on public pages: right slot becomes "Dashboard →" + avatar menu (public pages remain browsable when logged in).

---

## 2. Contributors

**Pattern**: left sidebar (RTL: right sidebar) + slim top bar, `_appLayout`. Sidebar is the workspace map; top bar carries identity, notifications, quota.

### Sidebar (top → bottom)
1. **Dashboard**
2. **Explore** — projects (`/explore`)
3. **Tasks** — task feed (`/tasks`)
4. **My applications** (`/applications`) — badge: items needing action (revision requested, accepted-awaiting-delivery)
5. **My skills** (`/skills`) — badge/dot when profile status changed (approved/adjusted/rejected)
6. ---
7. **Settings** (`/settings`)

Sidebar footer: plan chip ("Bronze · 1/2 applications today") → `/settings/subscription`. Quota lives permanently in nav per Principle 7 (limits visible before the act).

### Top bar
- Left: page title / contextual breadcrumb
- Right: notification bell (unread count; popover: latest 5 + "View all" → `/notifications`) · avatar menu

### Avatar (account) menu
View public profile (`/profile/$username`) · Settings · Language (ar/en) · Log out

### Contextual navigation
- **Onboarding**: sidebar hidden or disabled — the stepper *is* the navigation until activation; escape hatch: "Explore projects meanwhile" (browse allowed, apply gated).
- **Application detail**: pipeline stepper is the page's internal nav (stage anchors).
- **Breadcrumbs**: only on nested detail pages — `Tasks / Add JWT auth` · `Explore / sharek-backend`. One level deep; no crumb trails on top-level pages.

### Mobile
- Bottom tab bar (5): Dashboard · Explore · Tasks · Applications · Profile (opens account sheet containing skills/settings/notifications).
- Notifications: bell stays in the top bar.
- Filters (explore/tasks): bottom sheets.

### Primary creation action
Contributors don't create — they *apply*. No global "+" button; the primary CTA lives contextually on task details. The dashboard's hero action rotates by state (resume onboarding / apply / submit PR).

---

## 3. Project owners

**Pattern**: same shell as contributors (`_appLayout`), different sidebar content and different center of gravity: owners live in review queues.

### Sidebar
1. **Dashboard**
2. **My projects** (`/my-projects`)
3. **Review queue** — cross-project decision items, badge = total awaiting decision. **DECIDED (DEC-009)**: dashboard section named **"Needs your decision"** (applications waiting/aging, deliveries waiting, reports/disputes needing action), each item deep-linking to its context; **no `/inbox` route in MVP**. Revisit only when real owners regularly juggle many decision items across projects. Notifications stay separate from decision work.
4. ---
5. **Settings**

Sidebar footer: plan chip ("Silver · 14/20 orders this month") → `/settings/subscription`.

### Primary creation actions (two, both explicit)
- **Import project** — `/my-projects` primary button (+ empty-state hero).
- **New contribution request** — inside a project's Requests tab, with quota preview ("6 orders left this month") *on the button*, not after the form.
No floating global "+": creation is contextual to where the object lives. A global "+ New request" shortcut in the top bar is [Future] once owners have many projects.

### Contextual navigation
- **Project management** (`/my-projects/$projectId`): tabs — Overview · Requests · (Activity [Future]).
- **Request management** (`.../requests/$requestId`): tabs — Applications · Matches · Delivery · Details. Tab badges: Applications (pending count), Delivery (dot when submitted).
- **Breadcrumbs**: required here — the hierarchy is 3 deep: `My projects / sharek-backend / Add JWT auth`. Truncate middle on mobile.

### Mobile
Bottom tabs: Dashboard · Projects · Notifications · Settings. Review actions happen inside project/request pages; the dashboard surfaces "needs review" cards first on mobile.

---

## 4. Administrators

**Pattern**: dedicated `_adminLayout` — denser, cooler-toned utility shell. Clearly *not* the member app: admins must never confuse which hat they wear.

### Sidebar
1. **Overview** (`/admin`)
2. **Skill reviews** (`/admin/skill-reviews`) — badge: pending count; aging indicator (red when oldest > SLA)
3. **Disputes** (`/admin/disputes`) — badge: open
4. **Reports** (`/admin/reports`) — badge: open
5. **Users** (`/admin/users`)

### Top bar
Queue-jump search (user email / username / entity id) [UX-Required — queue work is lookup-heavy] · admin identity chip ("Admin · Sara") · log out.

### Contextual navigation
- **Skill review workspace**: previous/next-in-queue controls in the header (work the queue without returning to the list; keyboard: J/K) [UX-Required].
- **Disputes/Reports**: list + right-side detail drawer; breadcrumbs unnecessary.
- **Cross-links**: every entity reference (user, project, application) deep-links to its admin drawer or the public view, opening in context.

### Mobile
Admin is desktop-first. Mobile gets a functional read-only-plus (view queues, resolve simple reports); the skill-review workspace redirects mobile users to "best on desktop" with a basic fallback list. Documented as an accepted MVP constraint.

### Role switching
Not supported in MVP (single-enum role — [Confirmed]). If an admin also has a member account, that's a separate login. Listed in open-questions.md (OQ-P1).

---

## Cross-cutting rules

| Concern | Rule |
|---|---|
| **Notification access** | Bell in top bar for all authenticated roles; popover + full page. Badge counts from the lifted unread-count global state (ARCHITECTURE.md). |
| **Search access** | `/explore` and `/tasks` own their search. Admin gets queue-jump search. No global omnisearch in MVP [Future]. |
| **Language toggle** | Public: in navbar. Authenticated: avatar menu + `/settings`. Switching applies instantly (mirrors layout) and persists to `preferred_language` [Confirmed field]. |
| **Active state** | Sidebar/tabs show a filled active indicator; the indicator edge sits toward the content (left edge LTR, right edge RTL). |
| **Badges** | Badges mean "items needing *your* action," never raw totals. A number that can't be acted on is noise. |
| **Route guards** | `beforeLoad` per layout: `_appLayout` requires session (→ `/login?redirect=`), role-mismatched routes redirect to the user's own surface, `_adminLayout` requires `role=admin` (404-style response, don't confirm the route exists). Onboarding-incomplete contributors land on `/onboarding` from any app route. |
| **Keyboard** | All navs fully keyboard-traversable; skip-to-content link first in DOM; focus visible always (WCAG 2.1 AA — NFR-005). |
