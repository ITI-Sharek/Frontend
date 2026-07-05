# ShareK Frontend Architecture

Status: greenfield design (repo currently only has the default `create-next-app` Pages Router scaffold — this document defines the target architecture to migrate to).

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Zustand · React Hook Form + Zod · Axios · JWT / httpOnly cookies.

---

## 1. Complete Folder Tree

```
sharek-frontend/
├── docs/
│   └── ARCHITECTURE.md
├── e2e/                                # Playwright specs — cross-module flows, kept outside src/
├── public/
├── src/
│   ├── middleware.ts                   # edge route guarding ((auth)/(app)/(admin))
│   │
│   ├── app/                            # Next.js App Router — routing + composition ONLY
│   │   ├── layout.tsx                  # root layout: <html>, global providers, fonts
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── not-found.tsx
│   │   ├── loading.tsx
│   │   ├── (public)/
│   │   │   ├── layout.tsx              # marketing shell (header/footer, no auth)
│   │   │   ├── page.tsx                # landing page
│   │   │   ├── pricing/page.tsx
│   │   │   └── about/page.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              # centered auth shell
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx              # authenticated shell: sidebar/topbar, session gate
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── profile/[username]/page.tsx
│   │   │   └── projects/
│   │   │       ├── page.tsx                    # project listing
│   │   │       ├── new/page.tsx
│   │   │       └── [projectId]/
│   │   │           ├── layout.tsx              # project sub-nav (tabs)
│   │   │           ├── page.tsx                # overview
│   │   │           ├── kanban/page.tsx
│   │   │           ├── discussion/page.tsx
│   │   │           ├── chat/page.tsx
│   │   │           ├── contributors/page.tsx
│   │   │           ├── roadmap/page.tsx
│   │   │           ├── reviews/page.tsx
│   │   │           └── settings/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx              # role-gated shell
│   │   │   ├── users/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── api/                        # Next.js route handlers, BFF-only (e.g. cookie relay)
│   │
│   ├── modules/                        # feature modules — all business logic lives here
│   │   ├── auth/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── contributors/
│   │   ├── reviews/
│   │   ├── chat/
│   │   ├── notifications/
│   │   ├── roadmaps/
│   │   ├── dashboard/
│   │   ├── kanban/
│   │   ├── discussion/
│   │   └── ai/
│   │       # each module (see §3 for full internal shape):
│   │       #   components/ hooks/ api/{queries,mutations,query-keys.ts}
│   │       #   services/ schemas/ types/ utils/ constants/ store/ index.ts
│   │
│   ├── shared/                         # feature-agnostic, reusable UI + generic utils ONLY
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn primitives (button, input, dialog, ...)
│   │   │   ├── layout/                 # AppShell, Sidebar, Header, Footer, PageHeader
│   │   │   ├── forms/                  # FormField, FormError, SearchInput, FileUploadField
│   │   │   ├── feedback/               # Spinner, Skeleton, EmptyState, ErrorFallback, Toaster
│   │   │   ├── navigation/             # Breadcrumbs, Tabs, Pagination, StepIndicator
│   │   │   ├── data-display/           # DataTable, Avatar, Badge, Card, StatCard
│   │   │   ├── modals/                 # ConfirmDialog, ModalProvider/useModal
│   │   │   ├── providers/              # component-scoped context (e.g. TooltipProvider)
│   │   │   └── icons/                  # custom SVG icon wrappers
│   │   ├── hooks/                      # useDebounce, useMediaQuery, useClickOutside, useLocalStorage
│   │   ├── utils/                      # cn(), formatDate, formatCurrency, string/array helpers
│   │   ├── constants/                  # feature-agnostic constants (breakpoints, regex, limits)
│   │   └── types/                      # ApiResponse<T>, PaginatedResponse<T>, ID, Nullable<T>
│   │
│   ├── providers/                      # app-wide singleton context providers
│   │   ├── query-provider.tsx          # QueryClientProvider + Devtools
│   │   ├── theme-provider.tsx
│   │   ├── auth-provider.tsx           # session bootstrap/rehydration on load
│   │   └── app-providers.tsx           # composes all of the above, used once in app/layout.tsx
│   │
│   ├── lib/                            # third-party client instances / framework glue
│   │   ├── axios/
│   │   │   ├── axios-instance.ts
│   │   │   └── interceptors/
│   │   │       ├── auth-interceptor.ts
│   │   │       ├── refresh-token-interceptor.ts
│   │   │       └── error-interceptor.ts
│   │   ├── query-client.ts             # getQueryClient() factory (SSR-safe)
│   │   └── socket/
│   │       └── socket-client.ts        # singleton socket.io/WS client for real-time features
│   │
│   ├── services/                       # cross-cutting services NOT owned by one feature
│   │   ├── file-upload.service.ts
│   │   ├── storage.service.ts          # typed localStorage/sessionStorage wrapper
│   │   └── analytics.service.ts
│   │
│   ├── hooks/                          # global app-infra hooks (not feature, not generic-UI)
│   │   ├── use-auth.ts                 # current user / isAuthenticated / logout
│   │   ├── use-permissions.ts
│   │   └── use-socket.ts
│   │
│   ├── stores/                         # global Zustand stores (genuinely app-wide only)
│   │   ├── auth.store.ts               # minimal session mirror (see §5)
│   │   ├── ui.store.ts                 # sidebar collapsed, active theme, global modal stack
│   │   └── notification.store.ts       # unread badge count (ephemeral, socket-driven)
│   │
│   ├── types/                          # global cross-cutting TypeScript types
│   │   ├── api.types.ts                # ApiResponse<T>, ApiError, PaginatedResponse<T>
│   │   └── global.types.ts             # Role, ID, Nullable<T>
│   │
│   ├── config/
│   │   ├── env.ts                      # zod-validated typed env access
│   │   ├── site.config.ts              # app name, metadata, external links
│   │   ├── routes.config.ts            # centralized ROUTES map
│   │   └── feature-flags.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── tokens.css                  # design tokens / CSS variables
│
├── .husky/
├── eslint.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Top-Level Folder Responsibilities

| Folder | Responsibility | Must NOT contain |
|---|---|---|
| `app/` | Routing, layouts, route-level composition (assembling feature components into a page), SSR data prefetch + hydration boundaries | Business logic, API calls, reusable components |
| `modules/` | All domain/business logic, one folder per feature | Cross-feature imports, generic UI primitives |
| `shared/` | Feature-agnostic, reusable presentation + generic utilities used by 2+ modules | Anything that imports from `modules/*` |
| `providers/` | App-wide singleton React context providers, composed once at the root | Business logic |
| `lib/` | Configured third-party client instances (axios, socket, query client) | React components/hooks |
| `services/` | Cross-cutting services not owned by a single feature (uploads, storage, analytics) | Feature-specific API calls (those live in `modules/*/services`) |
| `hooks/` (top-level) | Global app-infrastructure hooks depended on by many modules (`useAuth`, `usePermissions`) | Generic reusable UI hooks (those live in `shared/hooks`) |
| `stores/` (top-level) | Genuinely global client state (auth mirror, UI chrome, notification badge) | Feature-owned state (that lives in `modules/*/store`) |
| `types/` (top-level) | Cross-cutting types used everywhere (`ApiResponse<T>`, `Role`) | Feature-specific DTOs (those live in `modules/*/types`) |
| `config/` | Environment access, app constants, route map, feature flags | Runtime business logic |
| `styles/` | Global CSS, design tokens | Component-scoped styles (use Tailwind utility classes in place) |

**Why both `shared/` and top-level `hooks/`/`stores/`/`types/`/`services/` exist — the disambiguation rule:**
`shared/` holds things that are reusable because they're generic (a debounce hook, a date formatter, a Button). The top-level infra folders hold things that are singular/global by nature — there is exactly one auth session, one socket connection, one notification badge in the whole app. They aren't "reusable utilities," they're app-wide runtime concerns. If you're unsure which bucket something belongs in, ask: "would this make sense in a completely different app?" — if yes, `shared/`; if it's tied to *this app's* global runtime state, it's a top-level infra folder.

---

## 3. Feature Module Internal Architecture

Every module under `modules/` follows the same shape (create only the sub-folders a given module actually needs — don't scaffold empty folders):

```
modules/projects/
├── components/
│   ├── project-card/
│   ├── project-list/
│   └── project-form/
├── hooks/
│   └── use-project-filters.ts         # non-server-state UI logic hooks
├── api/
│   ├── query-keys.ts                  # centralized query key factory
│   ├── queries/
│   │   ├── use-projects-query.ts
│   │   └── use-project-detail-query.ts
│   └── mutations/
│       ├── use-create-project-mutation.ts
│       ├── use-update-project-mutation.ts
│       └── use-delete-project-mutation.ts
├── services/
│   └── projects.service.ts            # raw axios calls, pure functions, zero React
├── schemas/
│   └── project.schema.ts              # zod schemas (forms + API validation), source of truth for types
├── types/
│   └── project.types.ts               # types not derivable from a zod schema (API DTOs, enums)
├── store/
│   └── project-ui.store.ts            # OPTIONAL — only if the feature needs client-only state
├── utils/
│   └── project.utils.ts
├── constants/
│   └── project.constants.ts
└── index.ts                           # public barrel — the ONLY entry other layers may import
```

`services/` vs `api/` split: `services/*.service.ts` answer "how do I call this endpoint" (thin, framework-free, unit-testable, mockable). `api/queries` and `api/mutations` answer "how does React consume this via TanStack Query" (caching, invalidation, optimistic updates). This keeps HTTP concerns testable without React and keeps query-cache concerns out of the HTTP layer.

### Module responsibilities

- **auth** — login/register/forgot-reset-password forms & flows, session bootstrap orchestration. Owns the *domain* logic; does not own the global "who is logged in" flag (see §5) — every other module would otherwise be forced to depend on `auth`.
- **users** — public user profiles, user search, reputation display (consumes `reviews` data at the `app/` composition level, not by importing the module).
- **projects** — project CRUD, listing/filtering, project settings.
- **contributors** — contribution requests, invitations, per-project role management.
- **reviews** — ratings & reputation, review submission and aggregation.
- **chat** — real-time per-project chat; socket subscription hooks, message list, composer.
- **notifications** — notification center (list + read/unread), real-time delivery via socket; the *unread count badge* is lifted to the top-level `stores/notification.store.ts` since the header/sidebar (outside this module) needs it.
- **roadmaps** — open-source roadmap builder/viewer (milestones, structured tasks).
- **dashboard** — thin: aggregates widgets from other modules. Should contain almost no domain logic of its own; it's primarily an `app/` composition concern with a few dashboard-only presentational components.
- **kanban** — per-project board, drag-and-drop columns/cards, optimistic reordering.
- **discussion** — per-project threaded discussion board.
- **ai** — AI project assistant: streaming chat UI, prompt composer, conversation history.

### Core rule: no lateral imports between modules

`modules/*` may depend on `shared/`, `lib/`, `providers/`, and the top-level `hooks/`/`stores/`/`types/`/`services/`/`config/`. **A module must never import from another module.** If `dashboard` needs data from `projects` and `contributors`, that composition happens in `app/(app)/dashboard/page.tsx`, which is allowed to import from any module — that's the page's job. If two modules need the same *runtime* state (e.g. "current user"), lift it to a top-level store/hook instead of one module importing another.

This keeps the dependency graph a DAG that always points from `app/` → `modules/*` → `shared/`/infra, never sideways, which is what makes the codebase safe to keep growing for years without a tangled import graph.

---

## 4. Data Flow Architecture

**Read path (server state):**
```
Component (modules/*/components)
  → feature hook (modules/*/api/queries/use-x-query.ts, TanStack Query)
    → service function (modules/*/services/x.service.ts)
      → axios instance (lib/axios) — request interceptor attaches auth
        → NestJS REST API
      ← response ← error/refresh interceptors normalize
    ← typed DTO returned
  ← cached in QueryClient, component re-renders on cache update
```

**Write path (mutations):**
```
Form (React Hook Form + zod schema from modules/*/schemas)
  → mutation hook (modules/*/api/mutations/use-x-mutation.ts)
    → service function → axios → NestJS
  ← on success: invalidate/update relevant query-keys (modules/*/api/query-keys.ts)
  ← optimistic update optional, rolled back onError
```

**SSR prefetch (App Router + TanStack Query):**
Server Components in `app/**/page.tsx` call `queryClient.prefetchQuery` (using the same service functions, executed server-side with forwarded cookies), then wrap children in `<HydrationBoundary>`. The client picks up an already-warm cache — no loading spinner on first paint, and the client-side hook (`useProjectsQuery`) is unchanged whether it's hydrated or fetched fresh.

**Real-time path (chat, notifications, live kanban updates):**
```
lib/socket/socket-client.ts (singleton, authenticated)
  → feature socket hook (modules/chat/hooks/use-chat-socket.ts)
    → ephemeral UI (typing indicator, presence) → local/Zustand state
    → persisted data (new message, new notification) → queryClient.setQueryData / invalidateQueries
```
Real-time events are reconciled into the *same* TanStack Query cache used by the REST fetch, so there is one source of truth for server-originated data regardless of how it arrived.

---

## 5. State Management Strategy

**Rule:** if it originates from the server and can be refetched/revalidated, it belongs in **TanStack Query**. If it's created purely client-side to drive UI and has no server representation, it belongs in **Zustand**. Never store server data in Zustand; never store ephemeral UI state in TanStack Query.

| Belongs to TanStack Query | Belongs to Zustand |
|---|---|
| Projects, contributors, reviews, chat history, notifications list, kanban board data, discussion threads, roadmap data, user profiles | Sidebar collapsed / theme, modal open/close stack |
| The `me`/current-user fetch itself | Kanban drag-in-progress local order (before mutation settles) |
| Anything fetched via `GET` or derived from it | Chat draft text, typing indicators, presence |
| | Multi-step form wizard state prior to submission |

**The one gray area — auth session:** `useCurrentUser()` (a TanStack Query hook keyed `['auth','me']`) is the single source of truth. `stores/auth.store.ts` exists only because the axios interceptor and route-guard code run outside React and can't call hooks — it holds a minimal, synchronous mirror (`accessToken`, `isAuthenticated`) that is populated *from* the query's result (`onSuccess`/`select`), never fetched independently. This is the only sanctioned instance of the same fact living in two places, and it's one-directional (query → store, never the reverse).

---

## 6. API Architecture

- **`lib/axios/axios-instance.ts`** — single configured instance: `baseURL` from `config/env.ts`, `withCredentials: true` (httpOnly refresh cookie), sane timeout/headers.
- **`auth-interceptor.ts`** (request) — attaches `Authorization: Bearer <accessToken>` from `stores/auth.store.ts` if present.
- **`refresh-token-interceptor.ts`** (response) — on `401`, queues concurrent in-flight requests, calls `/auth/refresh` exactly once, retries the queued requests with the new token; on refresh failure, clears the session and redirects to `(auth)/login`.
- **`error-interceptor.ts`** — normalizes NestJS's `{ statusCode, message, error }` shape into a single app-level `ApiError` (`shared/types`), so no feature parses the backend error shape independently; feeds `shared/components/feedback` (toasts).
- **`services/*.service.ts`** (per module) — thin, framework-free async functions, one per resource. Fully unit-testable and mockable in isolation from React/Query.
- **`api/queries` / `api/mutations`** (per module) — TanStack Query wraps services; **queries and mutations are always separate files**, never mixed in one hook.
- **`query-keys.ts`** (per module) — centralized key factory (e.g. `projectKeys.detail(id)`) so invalidation is never a hand-typed magic string.
- **`lib/query-client.ts`** — `getQueryClient()` factory: a new instance per request on the server, a module-level singleton on the client (standard Next.js App Router + TanStack Query SSR pattern).
- **Auth token strategy** — short-lived access token kept in memory only (`stores/auth.store.ts`, never `localStorage`, to limit XSS blast radius); long-lived refresh token in an httpOnly cookie set by NestJS. On full page load, `providers/auth-provider.tsx` silently calls `/auth/refresh` (or `/auth/me`) to rehydrate the in-memory access token before rendering protected routes.
- **Real-time** — `lib/socket/socket-client.ts` is a singleton, authenticated with the same access token, consumed only through feature-level hooks (never imported raw into a component).

---

## 7. Component Architecture

- **`shared/components/ui`** — shadcn primitives, no business logic, feature-agnostic.
- **`shared/components/layout`** — app chrome: `AppShell`, `Sidebar`, `Header`, `PageContainer`.
- **`shared/components/forms`** — RHF + shadcn wrappers standardizing form fields/errors across all features.
- **`shared/components/feedback`** — `Spinner`, `Skeleton`, `EmptyState`, `ErrorFallback`, toast wiring — every feature's loading/empty/error state should reuse these, not reinvent them.
- **`shared/components/navigation`**, **`data-display`**, **`modals`**, **`icons`** — as named, all feature-agnostic.
- **`shared/components/providers`** vs top-level **`providers/`**: `shared/components/providers` holds small, component-scoped context (e.g. a `TooltipProvider` wrapper); top-level `providers/` holds true app-wide singletons (Query, Auth, Theme) composed exactly once in `app/layout.tsx`. If a provider needs to exist only once for the whole app, it's top-level; if it's a reusable wrapper a feature might mount locally, it's under `shared/components/providers`.

**Rule:** nothing in `shared/components` may import from `modules/*`. A component used by exactly one feature lives in that feature's `components/` until a *second* consumer appears — promote on reuse, not on creation ("rule of three" applied loosely, but never promote pre-emptively).

**Server vs. Client Components:** default to Server Components everywhere in `app/`. Add `'use client'` only at the leaf that actually needs it — forms, click handlers, or anything using Zustand/TanStack Query hooks/socket subscriptions/browser APIs. Never mark a whole page client because one child button needs an `onClick`; extract that child instead.

---

## 8. Import Strategy

Absolute imports via `tsconfig.json` paths, no deep relative chains:

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/modules/*": ["./src/modules/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

- Within a module: relative imports between siblings are fine (`./components/project-card`).
- Across modules/layers: always the absolute alias, and always through a module's `index.ts` barrel — never deep-import another module's internal file (`@/modules/projects/components/internal/foo` from outside `projects` is forbidden). Enforce with an ESLint rule (`import/no-internal-modules` or `eslint-plugin-boundaries`) so the rule is machine-checked, not just documented.

---

## 9. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case, always (regardless of content) | `project-card.tsx`, `use-projects-query.ts` |
| Folders | kebab-case; module folders are plural resource names | `contributors/`, `data-display/` |
| Components | PascalCase export, matching kebab-case filename | `project-card.tsx` → `export function ProjectCard()` |
| Hooks | camelCase, `use-` prefixed file & export; query/mutation hooks suffixed accordingly | `use-project-filters.ts` → `useProjectFilters`; `useProjectsQuery`, `useCreateProjectMutation` |
| Stores | filename suffixed `.store.ts`, export `useXStore` | `project-ui.store.ts` → `useProjectUiStore` |
| Types/Interfaces | PascalCase, no `I`/`T` prefixes; `interface` for extensible object shapes (props, DTOs), `type` for unions/aliases | `ProjectCardProps`, `type ProjectStatus = 'draft' \| 'active'` |
| Enums | Prefer string-literal unions over `enum` (better tree-shaking, erasable); use real backend-mirroring `enum` only when it must map 1:1 to a NestJS enum | `type ProjectStatus = 'draft' \| 'active' \| 'archived'` |
| Constants | `UPPER_SNAKE_CASE` for primitives, camelCase for config objects | `MAX_FILE_SIZE_MB`, `queryConfig` |
| Env vars | `SCREAMING_SNAKE_CASE`; `NEXT_PUBLIC_` only for values needed in the browser; access only through `config/env.ts` (zod-validated), never raw `process.env.X` inline | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` |

Suffix conventions for cross-referencing the NestJS backend: `*Dto`/`*Response` for API payload types, `*Props` for component props, `*Filters` for query params — keeping frontend type names traceable to backend DTOs.

---

## 10. Barrel Exports (`index.ts`)

**Use barrels for:**
- Each feature module's root (`modules/projects/index.ts`) — this is the module's public API/contract; everything another layer needs must be re-exported here, everything else is private to the module.
- Category-level barrels inside `shared/components/*` (e.g. `shared/components/ui/index.ts`) for ergonomic imports of primitives.

**Avoid barrels for:**
- Single-component folders one level deep — an extra re-export with no consumer benefit.
- A single top-level `shared/index.ts` aggregating everything — creates a monolithic coupling point, hurts tree-shaking, and is a common source of accidental circular imports.
- Barrels that mix Server/Client-only exports carelessly — a client component importing one named export from a feature barrel can pull in server-only code transitively (a known App Router footgun); keep barrels narrow and be deliberate about what a module re-exports.

---

## 11. Code Standards

- **Component size:** if a component's JSX exceeds ~150–200 lines or mixes more than one responsibility, extract sub-components or a hook.
- **Hook size:** a hook should do one thing (one query, one piece of derived UI logic); compose multiple small hooks in the component rather than writing one large hook.
- **Function size:** service/util functions stay small and pure; if a service function branches on more than 2–3 concerns, split it.
- **Folder ownership:** every folder under `modules/*` has exactly one owning feature; nothing is shared by convenience — promote to `shared/` deliberately (see §7 rule).
- **Dependency direction:** `app/` → `modules/*` → `shared/` + top-level infra → `lib/`. Never the reverse, never sideways between modules (see §3).
- **Error handling:** normalized once in the axios error interceptor (`ApiError`); components/hooks never parse raw backend error shapes. Use `shared/components/feedback/ErrorFallback` + React error boundaries (`app/**/error.tsx`) for render-time failures, and toasts for mutation-time failures.
- **Loading states:** prefer Suspense boundaries (`app/**/loading.tsx`, `<Suspense>`) for server-driven initial loads; use TanStack Query's `isPending`/`isFetching` for client-driven interactions (refetch, mutation in flight).
- **Empty states:** always use `shared/components/feedback/EmptyState`, never an ad hoc "no data" string per feature.
- **Server vs. Client Components:** default server; `'use client'` pushed to the smallest leaf possible (see §7).

---

## 12. Best Practices

- Enforce module boundaries with `eslint-plugin-boundaries` (or `no-restricted-imports`) so `modules/*` cannot import each other — make the architecture machine-checked, not just documented.
- Derive types from zod schemas (`z.infer<typeof schema>`) as the single source of truth for forms/API payloads instead of hand-duplicating a matching TS type.
- Centralize query keys per feature; never hand-type cache keys inline.
- Type Axios responses against shared envelopes (`ApiResponse<T>`, `PaginatedResponse<T>` in `shared/types`) once, reuse everywhere.
- Standardize loading/empty/error UI via `shared/components/feedback` so every feature feels consistent.
- Husky + lint-staged run ESLint/Prettier on staged files pre-commit; add a pre-push (or CI) `tsc --noEmit` gate for full type safety.
- Co-locate tests next to source (`*.test.ts` beside services/utils; RTL tests beside feature components).

## Common Mistakes to Avoid

- Feature modules importing each other directly — untangles into a dependency graph that can't be safely refactored as the app grows.
- Dumping reusable-ish components into `shared/` "just in case" before a second consumer exists.
- Storing server data in Zustand for convenience, causing drift from the TanStack Query cache.
- Marking an entire page `'use client'` because one child needs interactivity.
- Inline axios calls in components instead of the `services/` layer — untestable and breaks the SSR-prefetch pattern.
- Deep relative imports (`../../../../shared/components/ui/button`) instead of the `@/` alias — obscures boundaries and breaks on refactors.
- Giant barrel files re-exporting everything, risking circular imports and leaking server-only code into client bundles.
- Parsing/hardcoding the backend's raw error shape in multiple places instead of the single error interceptor.
- Skipping a query-key factory and hand-typing cache keys, causing silent invalidation bugs.

## Suggested Improvements for Long-Term Scalability

- Generate frontend types/services directly from the NestJS OpenAPI/Swagger spec (`openapi-typescript` + `orval`) so DTOs never drift from the backend's Clean Architecture layer.
- Split into a Turborepo/Nx monorepo (`packages/ui`, `packages/api-client`) if/when a second frontend (admin panel, marketing site) is needed, so `shared/` isn't copy-pasted.
- Add Storybook for `shared/components` once component count grows, to keep reuse discoverable and catch visual regressions.
- Introduce `config/feature-flags.ts` + a provider early — a growing SaaS with AI assistant/roadmap features will want staged rollouts.
- Add Playwright E2E specs (top-level `e2e/`) per critical cross-module flow (auth, create project, kanban DnD, chat, AI assistant).
- Centralize telemetry/analytics (`services/analytics.service.ts`) early rather than bolting on ad hoc tracking per feature later.
- Once the team grows, map CODEOWNERS to `modules/*` — the structure already gives natural per-feature team ownership.
