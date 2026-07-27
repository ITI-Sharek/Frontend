# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the `sharek-frontend/` project only. It is a standalone Git repository.
Shared product policy is maintained in the sibling `../docs` Git repository;
read `../docs/README.md` before planning product behavior. Do not recreate that
documentation in the frontend repository.

## Active Spec Kit plan

`AGENTS.md` points to the currently active plan: `specs/001-contributor-profile-redirect/plan.md` (spec: `spec.md`, contract: `contracts/contributor-profile.md`, data model: `data-model.md`). Read it before implementing contributor-profile or login-redirect work — it defines the authoritative module/route boundaries for that feature.

## Commands

```bash
pnpm install
pnpm dev                # vite dev --port 3001
pnpm build               # vite build
pnpm start                # vite preview (serve production build)
pnpm generate-routes    # tsr generate -> regenerates src/routeTree.gen.ts; never hand-edit that file
pnpm lint                # eslint (TanStack shared config, see eslint.config.js)
pnpm test                 # vitest run
pnpm test -- <pattern>   # run a single test file, e.g. pnpm test -- login.test.tsx
```

Backend API defaults to `http://localhost:4000` (`VITE_API_URL` in `.env`, see `.env.example`); point it elsewhere with `VITE_API_URL=http://localhost:<port> pnpm dev` if the backend runs somewhere else. The contributor-profile flow needs these backend endpoints live: `POST /auth/login`, `GET /auth/me`, `POST /contributors/profiles/me/ensure`, `GET /contributors/profiles/:username`.

Tests are co-located with source as `*.test.ts`/`*.test.tsx` (e.g. `src/routes/_authLayout/login.test.tsx`, `src/modules/contributors/services/contributors.service.test.ts`). `tsr.config.json` excludes `*.test.tsx`, `*.helpers.ts`, and `profile-route-state.ts` from route generation, so route-adjacent test/helper files can live next to their route without being picked up as routes.

## Architecture

Full detail lives in `docs/ARCHITECTURE.md` — read it before adding a new module or top-level folder. Key rules, condensed:

**Dependency direction is one-way**: `routes/ -> modules/* -> shared/ + top-level infra (lib/, providers/, hooks/, stores/, types, services, config) -> lib/`. Never import sideways.

- `routes/` — TanStack Router file routes only: routing, layout composition (`_authLayout`, `_appLayout`, `_adminLayout` pathless layouts), loaders/`beforeLoad`, pending/error/not-found states. No business logic, no raw API calls, no reusable components. Route files should stay thin; extract to the owning module if JSX grows or logic becomes domain-specific.
- `modules/<feature>/` — all business logic, one folder per feature. Currently implemented: `auth`, `contributors`, `github`, `home`, `projects`. `docs/ARCHITECTURE.md` also plans `users`, `reviews`, `chat`, `notifications`, `roadmaps`, `dashboard`, `kanban`, `discussion`, `ai` — create these only when that feature work actually starts. Each module creates only the subfolders it needs: `components/`, `hooks/`, `api/{queries,mutations,query-keys.ts}`, `services/`, `schemas/`, `types/`, `store/`, `utils/`, `constants/`, `index.ts` (barrel).
  - `services/*.service.ts` are thin, framework-free HTTP calls — no React.
  - `api/queries/*` and `api/mutations/*` are TanStack Query hooks consuming those services; they own caching, invalidation, and optimistic updates.
  - **A module must never import another module directly.** Cross-feature composition (e.g. a route needing both `projects` and `contributors`) happens in the route file, not between modules.
- `shared/` — feature-agnostic UI (`components/ui` shadcn primitives, `components/layout`, `components/navigation`, plus planned `forms/`, `feedback/`, `data-display/`, `modals/`, `icons/`) and generic `utils/`/hooks. Must never import from `modules/*`. Promote a component here only after real reuse appears, not preemptively.
- `providers/` — true app-wide singleton React providers, composed once in `routes/__root.tsx`.
- `lib/` — configured third-party clients / framework glue: `lib/axios/axios-instance.ts` plus interceptors (`auth-interceptor.ts` attaches the bearer token, `refresh-token-interceptor.ts` handles 401s/queuing/retry), `lib/query-client.ts`.
- `services/`, `hooks/`, `stores/`, `types/`, `config/` at the top level are for genuinely global, cross-cutting concerns (e.g. `src/services/storage.service.ts`, `src/config/routes.config.ts`) — not feature-specific logic.

**State rule**: anything server-originated and refetchable belongs in TanStack Query. Pure client UI state (sidebar collapsed, modal stack, drag-in-progress order, in-progress form-wizard state) belongs in local React state or Zustand. Never store server data in Zustand. The one exception is a minimal synchronous auth mirror (`stores/auth.store.ts`) for axios interceptors/route guards, populated from the `useCurrentUser()` query result — never fetched independently.

**Auth token strategy**: short-lived access token kept in memory only; refresh token in an httpOnly cookie set by the backend. `refresh-token-interceptor.ts` handles 401s, queues concurrent requests, calls `/auth/refresh` once, retries, and clears session on failure.

**Import strategy**: use path aliases (`@/*`, `@/modules/*`, `@/shared/*`, `@/lib/*`, defined in `tsconfig.json`) for cross-layer references; relative imports are fine between siblings within a module. Import another module's exports through its root barrel (`modules/<feature>/index.ts`) only — never deep-import another module's internals.

**Naming**: kebab-case files/folders; PascalCase component exports matching the kebab-case filename; hook files `use-thing.ts` exporting `useThing`; Zustand stores `*.store.ts` exporting `useXStore`; `*Dto`/`*Response` for API payloads, `*Props` for component props.

`src/routeTree.gen.ts` is generated by `pnpm generate-routes` — never hand-edit it.

## Agent skills

### Issue tracker

Issues are tracked in `ITI-Sharek/Frontend` GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Share-k's canonical domain language and accepted ADRs are in the sibling
`../docs` repository. See `docs/agents/domain.md`.
