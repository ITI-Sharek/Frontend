# Implementation Plan: Contributor Profile Redirect

**Branch**: `001-contributor-profile-redirect` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-contributor-profile-redirect/spec.md`

## Summary

Build a contributor profile experience and make it the post-login destination for contributor users. The plan uses the existing TanStack Start/TanStack Router frontend architecture: route files stay thin, contributor profile business logic lives in a feature module, server-originated profile/session data flows through feature services and TanStack Query, and the login flow performs role-aware navigation after successful authentication.

## Technical Context

**Language/Version**: TypeScript 6.x, React 19.2.x

**Primary Dependencies**: TanStack Start, TanStack Router, TanStack Query, Axios, Tailwind CSS 4, shadcn/ui-style shared primitives

**Storage**: Backend-owned contributor profile/session data; frontend stores no server data outside TanStack Query. Existing token storage remains as currently implemented until auth infrastructure is migrated.

**Testing**: ESLint, TypeScript no-emit checks, Vitest/unit tests where available, route/component tests, and Playwright E2E for login-to-profile flow when E2E harness exists.

**Target Platform**: Browser web app served by TanStack Start/Vite/Nitro SSR.

**Project Type**: Frontend web application.

**Performance Goals**: Contributor reaches a meaningful profile state within 5 seconds after successful login under normal network conditions, matching SC-002.

**Constraints**: Route files remain composition-only; profile data is server state; contributor username is the canonical route identifier; authenticated users can view contributor profiles by username with private fields hidden.

**Scale/Scope**: One contributor profile route, one contributor feature module, role-aware login redirect changes, profile read/auto-create service integration, empty/error states, and validation coverage for contributor/non-contributor login outcomes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Route composition boundary**: PASS. Planned route files are `src/routes/_appLayout/profile.$username.tsx` and existing auth login route composition; domain behavior remains in modules.
- **TanStack routing**: PASS. Dynamic profile route uses TanStack file-route syntax with `$username`; login redirect uses TanStack navigation after session resolution.
- **Feature ownership**: PASS. Contributor profile domain logic belongs in `src/modules/contributors/`; authentication/session handling remains in `src/modules/auth/`; contributor profile ensure + post-login navigation is composed at `src/routes/_authLayout/login.tsx`.
- **Module isolation**: PASS. `auth` does not import contributor internals. Shared route helpers/config can provide destination construction; route-level composition can import public module barrels.
- **Shared placement**: PASS. New profile UI stays feature-local unless existing shared primitives already cover the need.
- **State ownership**: PASS. Contributor profile and current user/session data are server-originated and use TanStack Query/services; only form/loading local UI state remains local.
- **API boundary**: PASS. Profile reads/auto-create calls are service functions; query/mutation hooks wrap them.
- **Typing and validation**: PASS. Profile DTOs and payload expectations are typed in module types/contracts; no component parses backend error shapes directly.
- **Import strategy**: PASS. Cross-layer imports use `@/*`; module consumers import through root barrels.
- **Server/browser split**: PASS. Browser-only navigation stays in client interaction code; route loaders contain only SSR-safe prefetch/redirect logic.
- **Validation plan**: PASS. Unit tests cover redirect decision and profile mapping; component/route tests cover profile states; E2E covers successful contributor login redirect.

## Project Structure

### Documentation (this feature)

```text
specs/001-contributor-profile-redirect/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── contributor-profile.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   ├── _authLayout/login.tsx
│   └── _appLayout/
│       └── profile.$username.tsx
├── config/
│   └── routes.config.ts
├── modules/
│   ├── auth/
│   │   ├── components/login-form.tsx
│   │   └── services/auth.service.ts
│   └── contributors/
│       ├── api/
│       │   ├── query-keys.ts
│       │   ├── queries/use-contributor-profile-query.ts
│       │   └── mutations/use-ensure-contributor-profile-mutation.ts
│       ├── components/
│       │   ├── contributor-profile-view.tsx
│       │   ├── contributor-profile-empty-state.tsx
│       │   └── contributor-profile-error.tsx
│       ├── services/contributors.service.ts
│       ├── types/contributor-profile.types.ts
│       └── index.ts
└── shared/
    └── components/
        ├── feedback/
        └── ui/
```

**Structure Decision**: Use the existing TanStack Start frontend layout. Add a `contributors` module for contributor profile ownership and one authenticated dynamic route for profile composition. Keep authentication/session handling in `auth`, compose contributor profile ensure + post-login navigation in the login route, and keep route construction centralized in `routes.config.ts`.

## Complexity Tracking

No constitution violations.

## Phase 0: Research Summary

See [research.md](./research.md). Key decisions:

- Contributor profile route uses username as the canonical public identifier.
- Missing contributor profiles are auto-created on first successful contributor login.
- Authenticated profile visibility uses owner/private-field filtering.
- Login redirect logic remains role-aware and does not route non-contributors to contributor profiles.

## Phase 1: Design Summary

Generated artifacts:

- [data-model.md](./data-model.md)
- [contracts/contributor-profile.md](./contracts/contributor-profile.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Route composition boundary**: PASS. Profile route composes query-backed module UI and does not own HTTP calls.
- **TanStack routing**: PASS. Dynamic profile route is represented as `_appLayout/profile.$username.tsx`.
- **Feature ownership**: PASS. Contributor profile entities, services, hooks, and UI are owned by `modules/contributors`.
- **Module isolation**: PASS. Cross-feature behavior is limited to route composition and config helpers.
- **Shared placement**: PASS. No new generic shared components are required by design.
- **State ownership**: PASS. Profile and session remain server-originated data; only UI transient state is local.
- **API boundary**: PASS. Contract requires service-level access for profile read/ensure operations.
- **Typing and validation**: PASS. Contract and data model define DTO fields and privacy expectations.
- **Import strategy**: PASS. Public exports from `modules/contributors/index.ts` are the route import surface.
- **Server/browser split**: PASS. Route loader can prefetch by username; browser navigation occurs after login success.
- **Validation plan**: PASS. Quickstart defines lint/type checks plus contributor, non-contributor, missing-profile, and privacy validation scenarios.
