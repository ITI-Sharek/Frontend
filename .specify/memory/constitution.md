# ShareK Frontend Constitution

## Core Principles

### I. Routing Is Composition Only
TanStack Router route files and pathless layouts are responsible for page composition, shell selection, metadata/head setup, redirects, route loaders, pending/error states, and SSR prefetch boundaries only. They must not contain business logic, raw API calls, reusable UI primitives, or feature-owned state. The target routing model is TanStack Start with file-based TanStack Router routes as documented in `docs/ARCHITECTURE.md`.

### II. Feature Modules Own Domain Logic
All domain behavior lives under `src/modules/<feature>/`. A module may expose components, hooks, query/mutation hooks, services, schemas, types, constants, utils, and optional feature-local stores through its root `index.ts` public barrel. Modules must not import from other modules. Cross-feature composition happens at the route/page layer; shared runtime concerns are lifted to top-level infra folders.

### III. Shared Means Feature-Agnostic
`src/shared/` is reserved for reusable, feature-agnostic UI and generic utilities that would make sense in another app. Shared code must never import from `src/modules/*`. Components used by only one feature stay in that feature until real reuse exists. App-wide singleton concerns belong in top-level `providers/`, `hooks/`, `stores/`, `services/`, `types/`, `lib/`, or `config/`, not in `shared/`.

### IV. Server State And Client State Stay Separate
Server-originated data that can be refetched belongs in TanStack Query. Pure client UI state belongs in Zustand or local component state. Server data must not be duplicated in Zustand. The only sanctioned exception is the minimal auth session mirror needed by axios interceptors and route guards; it is populated from the current-user query and never fetched independently.

### V. Typed Boundaries Are Mandatory
HTTP access flows through feature services and the configured axios instance; components must not call axios inline. React consumption of server data flows through separate query and mutation hooks, with query keys centralized per module. Forms and API payloads use Zod schemas where practical, with TypeScript types derived from those schemas to avoid drift. Backend error shapes are normalized once in the axios error interceptor.

### VI. Import Boundaries Must Be Machine-Checked
Absolute aliases are required for cross-layer imports: `@/*`, `@/modules/*`, `@/shared/*`, and `@/lib/*`. External consumers must import a feature only through its root barrel, never through internal paths. ESLint must enforce no lateral module imports, no `shared -> modules` imports, and no deep internal module imports before the architecture is considered complete.

## Architecture Constraints

The canonical target architecture is `docs/ARCHITECTURE.md`. When this constitution and that document conflict, this constitution controls governance and `docs/ARCHITECTURE.md` supplies implementation detail.

Required target stack:

- TanStack Start, TanStack Router, Vite/Nitro SSR, React 19, TypeScript, Tailwind CSS 4, shadcn/ui.
- TanStack Query for server state, Zustand for app-wide client-only state.
- React Hook Form with Zod for form state and validation.
- Axios with normalized interceptors for auth, refresh, and errors.
- JWT access token in memory only; refresh token in httpOnly cookies.

Required source boundaries:

- `src/routes/`: TanStack Router file routes, route composition, loaders, redirects, and pending/error components.
- `src/router.tsx`: router factory and TanStack Router type registration.
- `src/routeTree.gen.ts`: generated route tree, never edited manually.
- `src/modules/`: feature-owned domain logic and public feature barrels.
- `src/shared/`: feature-agnostic UI and generic utilities only.
- `src/providers/`: app-wide singleton providers composed once in `src/routes/__root.tsx`.
- `src/lib/`: third-party instances and framework glue, not React components/hooks.
- `src/services/`, `src/hooks/`, `src/stores/`, `src/types/`, `src/config/`: top-level app infrastructure only.

## Development Workflow And Quality Gates

Every feature plan must pass these checks before implementation:

- Confirm the feature's owning module and list any route-level composition points.
- Confirm no new lateral imports between `src/modules/*`.
- Confirm server data uses feature services plus TanStack Query, not Zustand or inline axios.
- Confirm client-only state uses local state or Zustand, not TanStack Query.
- Confirm reusable UI placement is justified by actual reuse; otherwise keep it feature-local.
- Confirm new API payloads, forms, and errors are typed through schemas/shared envelopes/interceptors.
- Confirm route files stay thin and browser-only APIs do not leak into route loaders or server execution paths.
- Confirm tests or validation cover new services, utilities, forms, and critical cross-module flows when applicable.

Implementation must keep files kebab-case except TanStack Router file-route syntax, components PascalCase, hooks `use-*`, stores `*.store.ts`, and env access centralized through `src/config/env.ts`. Browser-exposed env vars use `VITE_`. New folders should be created only when they contain real code; do not scaffold empty module subfolders.

## Governance

This constitution supersedes ad hoc implementation preferences and must be checked by every Spec Kit plan, task breakdown, and code review. Amendments require updating this file, updating affected Spec Kit templates if gates change, and documenting any migration impact in the relevant plan or architecture document.

Versioning follows semantic intent:

- MAJOR: changes to core principles or dependency direction.
- MINOR: new required gates, stack constraints, or source-boundary rules.
- PATCH: wording, clarification, or non-behavioral documentation fixes.

**Version**: 2.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
