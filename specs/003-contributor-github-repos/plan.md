# Implementation Plan: Contributor GitHub Repositories

**Branch**: `003-contributor-github-repos` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-contributor-github-repos/spec.md`

## Summary

Build an authenticated contributor-facing "My GitHub repositories" section that first checks GitHub account connection, then lists every repository returned by the existing backend (public and private per OAuth scope), and lets the contributor inspect per-repository statistics. The implementation stays inside the existing TanStack Start frontend architecture: the `github` module owns DTOs, services, query hooks, and feature UI; the route file only composes the module into a page and defines its route path locally because `src/config/routes.config.ts` is frozen by DEC-029.

## Technical Context

**Language/Version**: TypeScript 6.x, React 19.2.x

**Primary Dependencies**: TanStack Start, TanStack Router, TanStack Query, Axios, Tailwind CSS 4, shadcn-ui-style shared primitives, lucide-react icons where useful.

**Storage**: Backend-owned GitHub account/repository/statistics data. Frontend stores server data only in TanStack Query; no Zustand store is needed for this feature.

**Testing**: Vitest unit/component-style tests with React server rendering for component states and mocked axios/query options for service/query hook behavior. Required validation commands: `pnpm generate-routes`, `pnpm lint`, `pnpm test`, `pnpm build`.

**Target Platform**: Browser web app served by TanStack Start/Vite/Nitro SSR.

**Project Type**: Frontend web application.

**Performance Goals**: Connected contributors see the repository list or a clear empty/error state within 10 seconds under normal network conditions. Statistics load only after selection so the repository list is not blocked by per-repository calls.

**Constraints**: Do not modify backend code. Do not modify files already touched by `001-contributor-profile-redirect`, including `src/config/routes.config.ts`, app layout/navigation files, contributor profile files, project/dashboard files, and other frozen paths named in DEC-029 task input. Do not hand-edit `src/routeTree.gen.ts`; regenerate it with `pnpm generate-routes`.

**Scale/Scope**: One authenticated route, additive GitHub module service/type/query/component files, tests for services/query hooks/main list component, and Spec Kit artifacts. No project import, metadata editing, or background sync controls.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Route composition boundary**: PASS. New route file `src/routes/_appLayout/github.repositories.tsx` will define the path locally, set head metadata, and compose the GitHub module page.
- **TanStack routing**: PASS. Route uses TanStack Router file-route conventions. `src/routeTree.gen.ts` will be regenerated via `pnpm generate-routes`.
- **Feature ownership**: PASS. GitHub repository/statistics behavior belongs to `src/modules/github/`, with public exports added to `src/modules/github/index.ts`.
- **Module isolation**: PASS. The `github` module will not import other feature modules. Route-level composition may import the GitHub module and shared app layout already handles auth.
- **Shared placement**: PASS. No new shared components are planned; existing shared UI primitives under `src/shared/components/ui/` will be reused.
- **State ownership**: PASS. Account, repository, and statistics data use TanStack Query. Selected repository is local component state.
- **API boundary**: PASS. HTTP calls stay in `src/modules/github/services/github.service.ts`; query hooks wrap those calls under `src/modules/github/api/queries/`.
- **Typing and validation**: PASS. Backend payloads are represented as `*Dto` types in `src/modules/github/types/github.types.ts`. No forms or Zod schemas are needed.
- **Import strategy**: PASS. Route imports through `@/modules/github`; internal module files use relative imports within the module and `@/*` for app/shared imports.
- **Server/browser split**: PASS. Browser-only OAuth connect action stays in a button handler. No route loader uses browser APIs.
- **Validation plan**: PASS. Add service tests, query option/hook tests, main component state tests, route generation, lint, full test suite, and production build.

## Project Structure

### Documentation (this feature)

```text
specs/003-contributor-github-repos/
├── spec.md
├── checklists/
│   └── requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── github-repositories.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── routes/
│   └── _appLayout/
│       └── github.repositories.tsx              # new route, local path constant
├── modules/
│   └── github/
│       ├── api/
│       │   ├── query-keys.ts                    # new query key factory
│       │   └── queries/
│       │       ├── use-github-account-query.ts
│       │       ├── use-github-repositories-query.ts
│       │       ├── use-github-repository-statistics-query.ts
│       │       ├── use-github-repository-contribution-activity-query.ts
│       │       ├── use-github-repository-commit-signals-query.ts
│       │       └── github-queries.test.ts
│       ├── components/
│       │   ├── contributor-github-repositories-section.tsx
│       │   └── contributor-github-repositories-section.test.tsx
│       ├── services/
│       │   ├── github.service.ts                # add statistics-family service calls
│       │   └── github.service.test.ts           # new service coverage
│       ├── types/
│       │   └── github.types.ts                  # add statistics-family DTOs
│       └── index.ts                             # add public exports
└── routeTree.gen.ts                             # regenerated only
```

**Structure Decision**: Extend the existing `github` module because the domain is GitHub account/repository data. The route is a thin authenticated app route at `/github/repositories`, represented by `src/routes/_appLayout/github.repositories.tsx`; the path constant remains local to avoid touching frozen `src/config/routes.config.ts`.

## Complexity Tracking

No constitution violations.

## Phase 0: Research Summary

See [research.md](./research.md). Key decisions:

- Gate repository and statistics queries on GitHub account status.
- Treat provider statistics unavailable reasons as block-level soft states.
- Keep route path local until frozen route config/navigation files are available.
- Use Arabic copy with RTL layout while preserving LTR technical tokens.

## Phase 1: Design Summary

Generated artifacts:

- [data-model.md](./data-model.md)
- [contracts/github-repositories.md](./contracts/github-repositories.md)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Route composition boundary**: PASS. The route composes `ContributorGitHubRepositoriesSection` and does not call axios or own business logic.
- **TanStack routing**: PASS. The file-route name maps to `/github/repositories`; generated route tree is produced by the CLI.
- **Feature ownership**: PASS. DTOs, service functions, query hooks, UI, and tests are all under `src/modules/github/`.
- **Module isolation**: PASS. The GitHub module uses only its own internals plus shared UI/lib imports; no lateral module imports are introduced.
- **Shared placement**: PASS. UI remains feature-local because this is a GitHub-specific section.
- **State ownership**: PASS. TanStack Query owns server data; local component state owns selected repository only.
- **API boundary**: PASS. Services are thin framework-free axios wrappers; hooks own query keys and enabled behavior.
- **Typing and validation**: PASS. All backend responses are typed as DTOs. Unavailable reason strings are represented as a known union plus `github_http_${string}`.
- **Import strategy**: PASS. Route imports through `@/modules/github`; barrel exports are updated.
- **Server/browser split**: PASS. OAuth redirect uses existing browser-side `startGitHubConnect` only inside a click handler.
- **Validation plan**: PASS. Tests and required pnpm gates are listed in quickstart and tasks.
