# Tasks: Contributor Profile Redirect

**Input**: Design documents from `specs/001-contributor-profile-redirect/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/contributor-profile.md](./contracts/contributor-profile.md), [quickstart.md](./quickstart.md)

**Tests**: Include targeted unit/component/E2E validation tasks because the implementation plan and quickstart define redirect, profile state, and privacy validation as required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not depend on incomplete tasks.
- **[Story]**: User story label (`US1`, `US2`, `US3`) for story-phase tasks only.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the folders and route/config surfaces needed by all user stories.

- [X] T001 Create contributor module directories in `src/modules/contributors/`
- [X] T002 Create authenticated app route directory in `src/routes/_appLayout/`
- [X] T003 [P] Add contributor profile route helpers to `src/config/routes.config.ts`
- [X] T004 [P] Create contributor module public barrel in `src/modules/contributors/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core typed contracts and service boundaries that MUST be complete before user story implementation.

**Critical**: No user story work can begin until this phase is complete.

- [X] T005 Define contributor profile DTOs, view state types, and viewer relationship types in `src/modules/contributors/types/contributor-profile.types.ts`
- [X] T006 Update authenticated user/session types to include `username` in `src/modules/auth/types/auth.types.ts`
- [X] T007 Implement contributor profile service functions for get-by-username and ensure-current-profile in `src/modules/contributors/services/contributors.service.ts`
- [X] T008 Create contributor profile query key factory in `src/modules/contributors/api/query-keys.ts`
- [X] T009 Implement contributor profile query hook in `src/modules/contributors/api/queries/use-contributor-profile-query.ts`
- [X] T010 Implement ensure contributor profile mutation hook in `src/modules/contributors/api/mutations/use-ensure-contributor-profile-mutation.ts`
- [X] T011 Export contributor profile types, services, hooks, and components from `src/modules/contributors/index.ts`
- [X] T012 Validate username uniqueness and duplicate/invalid username failure handling in `src/modules/contributors/services/contributors.service.ts`

**Checkpoint**: Contributor profile data access and typed module exports are ready for story implementation.

---

## Phase 3: User Story 1 - Contributor lands on their profile after login (Priority: P1) MVP

**Goal**: After successful contributor login, route the contributor to their own username-based profile and keep non-contributors on existing role-based destinations.

**Independent Test**: Log in as a contributor and verify the first authenticated screen is that contributor's profile page; log in as a non-contributor and verify they are not sent to a contributor profile.

### Validation for User Story 1

- [X] T013 [P] [US1] Add post-login destination unit coverage in `src/routes/_authLayout/login.test.tsx`
- [X] T014 [P] [US1] Add username route helper unit coverage for unique username profile URLs in `src/config/routes.config.test.ts`

### Implementation for User Story 1

- [X] T015 [US1] Add role-aware post-login destination helper in `src/config/routes.config.ts`
- [X] T016 [US1] Update login success flow to return/store the authenticated session without importing contributor profile logic in `src/modules/auth/components/login-form.tsx`
- [X] T017 [US1] Create authenticated profile route shell in `src/routes/_appLayout/profile.$username.tsx`
- [X] T018 [US1] Compose contributor profile query and route params in `src/routes/_appLayout/profile.$username.tsx`
- [X] T019 [US1] Add contributor post-login orchestration that ensures the contributor profile then navigates by username in `src/routes/_authLayout/login.tsx`
- [X] T020 [US1] Add already-authenticated contributor redirect behavior that also ensures a profile exists before profile navigation in `src/routes/_authLayout/login.tsx`
- [ ] T021 [US1] Run User Story 1 live quickstart scenarios in `specs/001-contributor-profile-redirect/quickstart.md` once a backend API and contributor/non-contributor test accounts are available

**Checkpoint**: User Story 1 is independently functional as the MVP.

---

## Phase 4: User Story 2 - Contributor views a complete profile (Priority: P2)

**Goal**: Show a contributor profile with identity, role, bio, skills, GitHub status, reputation, availability, contribution history, and empty states for missing optional sections.

**Independent Test**: Open a contributor profile and verify all required sections render with populated data or actionable empty states, and private fields are hidden for non-owner authenticated viewers.

### Validation for User Story 2

- [X] T022 [P] [US2] Add component coverage for populated and empty profile sections in `src/modules/contributors/components/contributor-profile-view.test.tsx`
- [X] T023 [P] [US2] Add privacy visibility coverage for non-owner viewers in `src/modules/contributors/components/contributor-profile-view.test.tsx`

### Implementation for User Story 2

- [X] T024 [P] [US2] Create contributor profile empty-state component in `src/modules/contributors/components/contributor-profile-empty-state.tsx`
- [X] T025 [P] [US2] Create contributor profile section rendering helpers in `src/modules/contributors/components/contributor-profile-sections.tsx`
- [X] T026 [US2] Implement full contributor profile view in `src/modules/contributors/components/contributor-profile-view.tsx`
- [X] T027 [US2] Add owner completion prompts to contributor profile view in `src/modules/contributors/components/contributor-profile-view.tsx`
- [X] T028 [US2] Add authenticated non-owner private-field hiding to contributor profile view in `src/modules/contributors/components/contributor-profile-view.tsx`
- [X] T029 [US2] Wire profile view component into route composition in `src/routes/_appLayout/profile.$username.tsx`
- [ ] T030 [US2] Run User Story 2 live quickstart scenarios in `specs/001-contributor-profile-redirect/quickstart.md` once a backend API and authenticated viewer test accounts are available

**Checkpoint**: Contributor profile display is complete and independently testable.

---

## Phase 5: User Story 3 - Contributor can recover from profile load problems (Priority: P3)

**Goal**: Provide clear retry, not-found, unauthenticated, and incomplete-profile recovery states when the profile cannot be loaded normally.

**Independent Test**: Simulate missing profile data, unknown username, unauthenticated profile access, and service failure; verify the user sees a clear recovery path.

### Validation for User Story 3

- [X] T031 [P] [US3] Add component coverage for retryable profile error state in `src/modules/contributors/components/contributor-profile-error.test.tsx`
- [X] T032 [P] [US3] Add route state coverage for unknown username and unauthenticated profile access in `src/routes/_appLayout/profile.$username.test.tsx`

### Implementation for User Story 3

- [X] T033 [P] [US3] Create contributor profile error component in `src/modules/contributors/components/contributor-profile-error.tsx`
- [X] T034 [P] [US3] Create contributor profile not-found component in `src/modules/contributors/components/contributor-profile-not-found.tsx`
- [X] T035 [US3] Add retryable error handling to contributor profile route in `src/routes/_appLayout/profile.$username.tsx`
- [X] T036 [US3] Add unauthenticated profile access handling to contributor profile route in `src/routes/_appLayout/profile.$username.tsx`
- [X] T037 [US3] Add unknown username handling to contributor profile route in `src/routes/_appLayout/profile.$username.tsx`
- [ ] T038 [US3] Run User Story 3 live quickstart scenarios in `specs/001-contributor-profile-redirect/quickstart.md` once a backend API and authenticated/unauthenticated browser scenarios are available

**Checkpoint**: Failure and recovery states are complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and architecture hygiene across all stories.

- [X] T039 [P] Add final quickstart evidence notes to `specs/001-contributor-profile-redirect/quickstart.md`
- [X] T040 Verify all changed source files avoid lateral module imports and deep internal module imports in `src/`
- [ ] T041 Measure login-to-meaningful-profile timing against the 5-second target in `specs/001-contributor-profile-redirect/quickstart.md` once the backend profile endpoints are available
- [X] T042 Run lint validation defined in `package.json` with `pnpm lint`
- [X] T043 Run test validation defined in `package.json` with `pnpm test`
- [X] T044 Run route generation validation defined in `package.json` with `pnpm generate-routes`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 completion and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2; can begin in parallel with US1 after foundations, but route integration is easiest after US1 route shell exists.
- **Phase 5 US3**: Depends on Phase 2; can begin in parallel with US2 for standalone error components, route integration is easiest after US1 route shell exists.
- **Phase 6 Polish**: Depends on selected story phases being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundational tasks.
- **US2 (P2)**: Uses the profile route shell from US1 for final route composition but profile display components can be built independently after foundational tasks.
- **US3 (P3)**: Uses the profile route shell from US1 for final route error wiring but recovery components can be built independently after foundational tasks.

### Within Each User Story

- Validation tasks should be created before implementation where practical.
- Types and services precede query hooks.
- Query hooks precede route composition.
- Components can be developed in parallel when they touch separate files.
- Route integration happens after relevant components/hooks exist.

---

## Parallel Opportunities

- **Setup**: T003 and T004 can run in parallel after directories exist.
- **Foundation**: T005 and T006 can run in parallel; T008 can run after T005; T009 and T010 can run in parallel after T007 and T008.
- **US1**: T013 and T014 can run in parallel; T017 can begin while T015 is implemented; T018 waits for T009 and T017; T019 and T020 sequence route-level login orchestration in `src/routes/_authLayout/login.tsx`.
- **US2**: T022 and T023 can run in parallel; T024 and T025 can run in parallel; T027 and T028 both modify `contributor-profile-view.tsx` and should be sequenced.
- **US3**: T031 and T032 can run in parallel; T033 and T034 can run in parallel; route handling tasks T035-T037 should be sequenced because they share one route file.

## Parallel Example: User Story 1

```text
Task: "T013 [P] [US1] Add post-login destination unit coverage in src/routes/_authLayout/login.test.tsx"
Task: "T014 [P] [US1] Add username route helper unit coverage for unique username profile URLs in src/config/routes.config.test.ts"
Task: "T017 [US1] Create authenticated profile route shell in src/routes/_appLayout/profile.$username.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T022 [P] [US2] Add component coverage for populated and empty profile sections in src/modules/contributors/components/contributor-profile-view.test.tsx"
Task: "T024 [P] [US2] Create contributor profile empty-state component in src/modules/contributors/components/contributor-profile-empty-state.tsx"
Task: "T025 [P] [US2] Create contributor profile section rendering helpers in src/modules/contributors/components/contributor-profile-sections.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T031 [P] [US3] Add component coverage for retryable profile error state in src/modules/contributors/components/contributor-profile-error.test.tsx"
Task: "T033 [P] [US3] Create contributor profile error component in src/modules/contributors/components/contributor-profile-error.tsx"
Task: "T034 [P] [US3] Create contributor profile not-found component in src/modules/contributors/components/contributor-profile-not-found.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundational contracts/services/hooks.
3. Complete Phase 3 User Story 1.
4. Validate contributor login redirect and non-contributor destination behavior.
5. Stop and demo the MVP before expanding profile content.

### Incremental Delivery

1. Deliver US1 for correct contributor login routing.
2. Deliver US2 for complete profile display and privacy filtering.
3. Deliver US3 for robust recovery states.
4. Run polish validation after each selected increment.

### Team Parallel Strategy

1. One developer completes foundational contributors service/types/hooks.
2. One developer updates route-level login orchestration and route helpers for US1.
3. One developer builds profile display components for US2 after types are available.
4. One developer builds error/not-found components for US3 after route shell is available.

## Notes

- Keep route files composition-only.
- Do not import directly between feature modules; use route composition or shared config helpers.
- Keep contributor profile server data in TanStack Query, not Zustand.
- All cross-layer imports should use `@/*` aliases.
