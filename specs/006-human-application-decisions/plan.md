# Implementation Plan: Human Application Decisions

**Branch**: `006-human-decisions` | **Date**: 2026-07-30 | **Spec**:
[spec.md](./spec.md)

**Input**: GitHub issue #6 and
`specs/006-human-application-decisions/spec.md`

## Summary

Deliver an API-backed, assessment-independent Application review workflow
inside the existing Contribution Requests module. Project owners review every
pending Application from the existing owner Request detail, inspect its
approach, duration, contributor context, fixed evidence, and server-owned aging
state, then accept or decline through explicit human-decision confirmations.
Contributors receive a dedicated Application status view with distinct neutral
terminal copy and a moderation-report path for inappropriate decline feedback.

The existing Application service seam is corrected to match the delivered
NestJS contract before UI work: owner lists return a wrapper, Application
detail carries snapshots plus nullable Owner Decision and Assignment,
decision commands use `Idempotency-Key`, decline sends `feedback`, and feedback
reports post to the owner-decision moderation endpoint.

## Technical Context

**Language/Version**: TypeScript 6.x, React 19.2.x

**Primary Dependencies**: TanStack Start, TanStack Router, TanStack Query,
Axios, Tailwind CSS 4, lucide-react

**Storage**: Backend-owned Applications, immutable Owner Decisions,
Assignments, snapshots, review timing, and moderation reports. The frontend
stores server data only in TanStack Query and keeps dialog/form state locally.

**Testing**: Vitest service, presenter, component, interaction, and route-helper
tests; route generation; ESLint; Vite production build

**Target Platform**: Responsive browser app using the existing authenticated
owner/contributor shell, Arabic RTL copy, light/dark themes, keyboard input,
and 200% zoom/reflow

**Project Type**: TanStack Start frontend web application

**Performance Goals**: Queue and Application detail render from one request
each; successful or conflicted decisions invalidate only affected Request,
queue, and Application keys; decision feedback survives recoverable mutation
failure

**Constraints**: No backend changes; no assessment creation or result UI; no
frontend timers; no AI score, ranking, pass/fail, recommendation, or decision
gate; no private Application data in public routes; no lateral module imports

**Scale/Scope**: One owner queue embedded in the existing Request detail, one
contributor Application-status route, three accessible dialogs, one corrected
typed service boundary, and focused automated/visual validation

## Constitution Check

*GATE: Passed before research and re-checked after design.*

- **Route composition boundary**: PASS. The existing owner Request route keeps
  composing `ContributionRequestDetailView`; the new
  `applications.$applicationId.tsx` route performs role gating, metadata,
  parameter extraction, and component composition only.
- **TanStack routing**: PASS. The contributor status page uses file-route
  conventions and a typed route helper. Generated route output is never edited
  manually.
- **Feature ownership**: PASS. Application review, decisions, outcome copy,
  queries, mutations, services, types, dialogs, and tests remain in
  `src/modules/contribution-requests/` and are exported from its root barrel.
- **Module isolation**: PASS. No feature module imports another module. Route
  composition uses the contribution-requests and auth public barrels.
- **Shared placement**: PASS. No new shared primitive is required; existing
  `Button`, `Card`, `StatusChip`, and page-layout components are reused.
- **State ownership**: PASS. Server state uses feature services plus TanStack
  Query. Dialog visibility, decline feedback, report fields, and focus
  restoration use local component state.
- **API boundary**: PASS. Axios remains confined to
  `services/applications.service.ts`; queries and mutations remain separate.
- **Typing and validation**: PASS. DTO unions model backend responses; decision
  and report payloads are typed; validation is local and stable error branching
  uses backend error codes, never message matching.
- **Import strategy**: PASS. Cross-layer imports use `@/*`; routes consume only
  the module root barrel.
- **Server/browser split**: PASS. Focus management runs inside mounted client
  components; no browser API enters loaders or service modules.
- **Validation plan**: PASS. Service contract tests cover exact URLs, bodies,
  response wrappers, and idempotency headers. Presenter tests cover all status
  and aging states. Component/interaction tests cover decision availability,
  confirmation consequences, validation, conflict recovery, reporting, and
  prohibited copy. Route generation, lint, full tests, build, and responsive
  visual inspection complete the gate.

## Project Structure

### Documentation (this feature)

```text
specs/006-human-application-decisions/
├── checklists/requirements.md
├── contracts/application-review-api.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── config/
│   ├── routes.config.ts
│   └── routes.config.test.ts
├── routes/
│   └── _appLayout/
│       └── applications.$applicationId.tsx
└── modules/
    └── contribution-requests/
        ├── api/
        │   ├── mutations/
        │   │   ├── use-accept-application-mutation.ts
        │   │   ├── use-decline-application-mutation.ts
        │   │   └── use-report-decision-feedback-mutation.ts
        │   ├── queries/
        │   │   ├── use-application-query.ts
        │   │   └── use-owner-applications-query.ts
        │   └── query-keys.ts
        ├── components/
        │   ├── accept-application-dialog.tsx
        │   ├── application-status-view.tsx
        │   ├── decline-application-dialog.tsx
        │   ├── owner-application-review.tsx
        │   └── report-decision-feedback-dialog.tsx
        ├── constants/
        │   └── application-copy.ts
        ├── services/
        │   └── applications.service.ts
        ├── types/
        │   ├── application.types.ts
        │   └── assignment.types.ts
        ├── utils/
        │   └── application-presenter.ts
        └── index.ts
```

**Structure Decision**: Extend `contribution-requests` because an Application
is the contributor response to one Contribution Request and the module already
owns the typed Application/decision seam. The owner queue composes inside
`ContributionRequestDetailView`, while a thin route composes the contributor
status view. No new module or global provider is justified.

## Implementation Phases

### Phase 1 - Contract foundation

- Replace the incomplete legacy Application DTOs with the delivered backend
  projections, including contributor/profile context, snapshots, `overdue`,
  nullable Owner Decision, and nullable Assignment.
- Correct list/detail/decision/report calls and idempotency headers.
- Add stable error-code copy and query keys for Application detail.

### Phase 2 - Owner review and decisions

- Build the oldest-first queue from the backend order without client-side AI
  filtering.
- Present approach, duration, profile context, fixed evidence limitations, and
  explicit server aging state.
- Add accessible accept and decline dialogs, validation, focus restoration,
  success announcements, and conflict-driven refresh.
- Embed the queue in every owner Request state where pending Applications can
  still exist; decision action availability depends on Application status, not
  Request close time or assessment state.

### Phase 3 - Contributor outcome and moderation

- Add the authenticated Application detail route.
- Render distinct pending/accepted/declined/not-selected/expired/withdrawn/
  request-cancelled copy and neutral-effect explanations.
- Show immutable human feedback separately and enable factual moderation
  reporting only for an explicit decline with an Owner Decision ID.

### Phase 4 - Hardening and delivery

- Exercise long content, missing optional context, empty evidence, empty queue,
  stable conflicts, duplicate report, keyboard focus, RTL, narrow/mobile,
  desktop, dark theme, and reduced motion.
- Regenerate routes, run lint/tests/build, inspect the intended full diff,
  commit semantically, push, verify the remote SHA, and open a PR to `master`.

## Complexity Tracking

No constitution violations or justified exceptions.
