# Implementation Plan: Admin Skill Review and Realtime Notifications

**Branch**: `004-admin-skill-review-notifications` | **Date**: 2026-07-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-admin-skill-review-notifications/spec.md`

## Summary

Build the admin skill review workspace, the realtime notifications center, and the shared unread-state pipeline that keeps the contributor and admin shells in sync. The implementation stays inside the existing TanStack Start frontend structure: route files stay thin, `skill-profiles` owns review workflows, `notifications` owns feed and badge state, and a single authenticated Socket.IO connection updates the query cache and shell chrome without polling as the primary path.

## Technical Context

**Language/Version**: TypeScript 6.x, React 19.2.x

**Primary Dependencies**: TanStack Start, TanStack Router, TanStack Query, Axios, Socket.IO client, Tailwind CSS 4, lucide-react

**Storage**: Backend-owned review decisions, audit trail, notification feed, and unread counts. Frontend stores server data in TanStack Query plus transient selection and socket connection state only.

**Testing**: Vitest unit/component/route tests, route generation, lint, test, and build.

**Target Platform**: Browser web app served by TanStack Start/Vite/Nitro SSR.

**Project Type**: Frontend web application.

**Performance Goals**: Admin queue rows, review actions, and unread notification badges should update with near-real-time feedback; a dropped socket must fall back to cached data and refetch without breaking the shell.

**Constraints**: Route files remain composition-only; no backend code changes; skill-review logic stays in `src/modules/skill-profiles/`; notification logic stays in `src/modules/notifications/`; realtime connection setup should live in app-level provider code, not scattered across routes.

**Scale/Scope**: One admin queue and workspace, one notifications page and popover, one shared unread badge pipeline, one Socket.IO bridge, and contributor-facing status copy updates.

## Constitution Check

*GATE: Must pass before implementation. Re-check after the design pass.*

- **Route composition boundary**: PASS. New route files will only compose module UI, route metadata, and role guards.
- **TanStack routing**: PASS. New admin and notification screens use TanStack Router file routes and local route constants where needed.
- **Feature ownership**: PASS. Skill review behavior belongs in `src/modules/skill-profiles/`; notification behavior belongs in `src/modules/notifications/`.
- **Module isolation**: PASS. No lateral imports between feature modules; cross-feature assembly happens in route composition or a shared provider.
- **Shared placement**: PASS. Any shared shell chrome is generic; feature-specific logic stays in the owning module.
- **State ownership**: PASS. Server-originated queue, review, and notification data use TanStack Query; socket lifecycle and selected review item stay local or provider-owned.
- **API boundary**: PASS. Axios and realtime transport stay in services/provider code, not in route components.
- **Typing and validation**: PASS. Review and notification payloads will use typed DTOs and explicit unions instead of ad hoc parsing.
- **Import strategy**: PASS. Cross-layer imports use `@/*`; public barrels expose module APIs.
- **Server/browser split**: PASS. Socket startup stays on the client side; route loaders remain SSR-safe.
- **Validation plan**: PASS. Add focused service, hook, component, and route tests before running repo-wide gates.

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-skill-review-notifications/
├── spec.md
└── plan.md
```

### Source Code (repository root)

```text
src/
├── config/
│   ├── routes.config.ts                    # add admin / notifications paths and admin post-login routing
│   └── routes.config.test.ts               # extend route-helper coverage
├── providers/
│   ├── app-providers.tsx                   # mount the realtime notification provider
│   └── notifications-provider.tsx          # new socket/query bridge for unread state
├── lib/
│   └── socket/
│       └── socket-client.ts                # new authenticated Socket.IO client wrapper
├── routes/
│   ├── _appLayout.tsx                      # add unread badge / notifications entry points
│   ├── _appLayout/
│   │   └── notifications.tsx               # new notification center route
│   ├── _adminLayout.tsx                    # new admin shell and role gate
│   └── _adminLayout/
│       ├── skill-reviews.tsx               # pending queue page
│       └── skill-reviews.$userId.tsx       # review workspace page
├── modules/
│   ├── skill-profiles/
│   │   ├── api/
│   │   │   ├── query-keys.ts
│   │   │   ├── queries/
│   │   │   └── mutations/
│   │   ├── components/
│   │   │   ├── admin-skill-review-queue.tsx
│   │   │   ├── admin-skill-review-workspace.tsx
│   │   │   ├── skill-review-row.tsx
│   │   │   ├── evidence-panel.tsx
│   │   │   └── proficiency-adjuster.tsx
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── notifications/
│   │   ├── api/
│   │   │   ├── query-keys.ts
│   │   │   ├── queries/
│   │   │   └── mutations/
│   │   ├── components/
│   │   │   ├── notification-center.tsx
│   │   │   └── notification-popover.tsx
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── contributors/
│       └── components/
│           └── contributor-profile-sections.tsx   # surface review provenance and adjusted skill labels
```

**Structure Decision**: Extend the existing `skill-profiles` module for admin review workflows because the review queue is the next stage of the generated-skill lifecycle. Create a new `notifications` module for the notification feed and unread state. Keep route files thin and use the global provider layer for the single realtime connection so both authenticated shells stay in sync.

## Complexity Tracking

No constitution violations.

## Implementation Phases

### Phase 1: Routing and runtime foundation

- Add admin and notifications route constants.
- Update post-login routing so admin users land on the admin shell instead of the generic home route.
- Add `_adminLayout.tsx` with role gating and shell chrome.
- Mount a single authenticated notification provider from `AppProviders`.
- Add the Socket.IO client wrapper under `src/lib/socket/`.

### Phase 2: Realtime notifications

- Add notification DTOs, query keys, service wrappers, and query hooks.
- Build the notifications center page and the top-bar popover from the same data source.
- Wire socket events to query invalidation and unread badge updates.
- Add reconnect and refetch behavior so the feed still works if the socket drops.

### Phase 3: Admin skill review workspace

- Add the pending queue route and the per-contributor review workspace route.
- Implement queue ordering, evidence display, per-skill approve/reject/adjust actions, and the finish-review flow.
- Preserve original AI proficiency and review notes in the UI so the audit trail is visible.
- Keep the workspace desktop-first, but ensure the route degrades into a readable fallback on smaller screens.

### Phase 4: Contributor-side reflection

- Update contributor profile and shell copy to show pending, approved, rejected, and adjusted skill states.
- Surface notification entry points from the authenticated shell so contributors can open the relevant review outcome.
- Keep contributor activation itself backend-owned; the frontend only mirrors the current status.

### Phase 5: Validation

- Add service tests for route helpers, notification API wrappers, and skill review API wrappers.
- Add component tests for the queue, workspace, notification center, and unread badge states.
- Regenerate routes, then run lint, test, and build.
- If a browser harness is available, smoke-test admin queue loading and socket-driven badge updates end to end.
