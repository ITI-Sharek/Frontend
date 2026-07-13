# Tasks: Contributor GitHub Repositories

**Input**: Design documents from `/specs/003-contributor-github-repos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/github-repositories.md, quickstart.md

**Tests**: Required by FR-017 and the feature brief: query hook coverage plus main list component empty/error/loaded states.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create feature-owned folders needed by the GitHub module.

- [X] T001 Create GitHub api query and component folders in `src/modules/github/api/queries/` and `src/modules/github/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared DTOs, services, query keys, and tests needed by all user stories.

- [X] T002 Add statistics-family DTO types and unavailable-reason type in `src/modules/github/types/github.types.ts`
- [X] T003 Add statistics-family service functions in `src/modules/github/services/github.service.ts`
- [X] T004 [P] Add GitHub service tests in `src/modules/github/services/github.service.test.ts`
- [X] T005 Add GitHub query key factory in `src/modules/github/api/query-keys.ts`
- [X] T006 Export new GitHub services, types, and query hooks from `src/modules/github/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View my connected repositories (Priority: P1) MVP

**Goal**: Connected contributors can load and read all returned GitHub repositories, including private repositories.

**Independent Test**: Render the section with connected account + repositories and confirm public/private repository cards, metadata, and LTR repository names appear.

### Tests for User Story 1

- [X] T007 [P] [US1] Add query option tests for account-gated repository loading in `src/modules/github/api/queries/github-queries.test.ts`
- [X] T008 [P] [US1] Add loaded repository list component test in `src/modules/github/components/contributor-github-repositories-section.test.tsx`

### Implementation for User Story 1

- [X] T009 [US1] Add GitHub account and repository query hooks in `src/modules/github/api/queries/use-github-account-query.ts` and `src/modules/github/api/queries/use-github-repositories-query.ts`
- [X] T010 [US1] Add repository list loaded UI in `src/modules/github/components/contributor-github-repositories-section.tsx`

**Checkpoint**: User Story 1 should be functional and testable independently.

---

## Phase 4: User Story 2 - Connect GitHub before loading repositories (Priority: P1)

**Goal**: Contributors without a connected GitHub account see a connect state, and repository/statistics queries stay disabled.

**Independent Test**: Render the section with no connected account and confirm the connect CTA appears while repository/statistics query options are disabled.

### Tests for User Story 2

- [X] T011 [P] [US2] Add disconnected empty-state component test in `src/modules/github/components/contributor-github-repositories-section.test.tsx`
- [X] T012 [P] [US2] Add repository disabled-query test in `src/modules/github/api/queries/github-queries.test.ts`

### Implementation for User Story 2

- [X] T013 [US2] Add disconnected, loading, and account-error states in `src/modules/github/components/contributor-github-repositories-section.tsx`
- [X] T014 [US2] Wire connect CTA to existing GitHub connect flow from the route in `src/routes/_appLayout/github.repositories.tsx`

**Checkpoint**: User Story 2 should be functional and testable independently.

---

## Phase 5: User Story 3 - Inspect repository statistics (Priority: P2)

**Goal**: Contributors can select a repository and inspect repository statistics with graceful unavailable states.

**Independent Test**: Select or preselect a repository and confirm the statistics panel displays loaded data, pending/unavailable copy, or retryable errors without breaking the repository list.

### Tests for User Story 3

- [X] T015 [P] [US3] Add statistics query option tests in `src/modules/github/api/queries/github-queries.test.ts`
- [X] T016 [P] [US3] Add repository statistics loaded/unavailable component tests in `src/modules/github/components/contributor-github-repositories-section.test.tsx`

### Implementation for User Story 3

- [X] T017 [US3] Add statistics-family query hooks in `src/modules/github/api/queries/use-github-repository-statistics-query.ts`, `src/modules/github/api/queries/use-github-repository-contribution-activity-query.ts`, and `src/modules/github/api/queries/use-github-repository-commit-signals-query.ts`
- [X] T018 [US3] Add repository selection and statistics panel UI in `src/modules/github/components/contributor-github-repositories-section.tsx`
- [X] T019 [US3] Add graceful unavailable-reason presentation for contribution activity and commit signals in `src/modules/github/components/contributor-github-repositories-section.tsx`

**Checkpoint**: All user stories should be independently functional.

---

## Phase 6: Route & Validation

**Purpose**: Expose the section through a generated TanStack Router route and run required gates.

- [X] T020 Add authenticated route file with local path constant in `src/routes/_appLayout/github.repositories.tsx`
- [X] T021 Run `pnpm generate-routes` to regenerate `src/routeTree.gen.ts`
- [X] T022 Run `pnpm lint` and fix surfaced issues
- [X] T023 Run `pnpm test` and fix surfaced issues
- [X] T024 Run `pnpm build` and fix surfaced issues
- [X] T025 Confirm `git status --short` excludes forbidden files except pre-existing 001 changes and includes only this feature's intended changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup completion and blocks all user stories.
- **User Stories (Phase 3-5)**: Depend on foundational DTO/service/query-key work.
- **Route & Validation (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after foundational work.
- **User Story 2 (P1)**: Can start after account/repository query hooks exist; integrates with US1 component states.
- **User Story 3 (P2)**: Can start after repository list/selection exists.

### Parallel Opportunities

- T004 can run after T002-T003 and before UI work.
- T007/T008 can be authored in parallel because they touch different files.
- T011/T012 can be authored in parallel because they touch different files.
- T015/T016 can be authored in parallel because they touch different files.

## Implementation Strategy

1. Complete setup and foundational DTO/service/query-key work.
2. Deliver MVP connected repository list and loaded-state tests.
3. Add disconnected/account-gated behavior.
4. Add statistics drill-down and unavailable-reason handling.
5. Add route, regenerate route tree, and run all gates from quickstart.
