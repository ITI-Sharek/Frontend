# Tasks: Human Application Decisions

**Input**: Design documents from
`specs/006-human-application-decisions/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/application-review-api.md`, `quickstart.md`

**Tests**: Required by the feature specification and written before their
corresponding implementation.

**Organization**: Tasks are grouped by independently testable user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches a different file and has no
  incomplete dependency
- **[Story]**: Maps to a user story in `spec.md`

## Phase 1: Setup and baseline

**Purpose**: Protect the existing repository and establish a clean comparison
point before behavior changes.

- [x] T001 Verify Git, Node, ESLint, Vite, and package ignore configuration without changing the unrelated `package-lock.json`
- [x] T002 Run focused baseline tests for `src/modules/contribution-requests/` and record any pre-existing failures

---

## Phase 2: Foundational contract correction

**Purpose**: Match the delivered server contract before any new UI consumes it.

**⚠️ CRITICAL**: All user-story work depends on this phase.

- [x] T003 [P] Add failing Application list/detail/decision/report contract cases in `src/modules/contribution-requests/services/applications.service.test.ts`
- [x] T004 [P] Add failing status, aging, and stable-error presenter cases in `src/modules/contribution-requests/utils/application-presenter.test.ts`
- [x] T005 Correct Application, Owner Decision, Assignment, report, error, and command types in `src/modules/contribution-requests/types/application.types.ts` and `src/modules/contribution-requests/types/assignment.types.ts`
- [x] T006 Correct owner-list wrapper, Application detail, idempotent accept/decline, and feedback-report transport in `src/modules/contribution-requests/services/applications.service.ts`
- [x] T007 Add Application detail query key/hook and report mutation in `src/modules/contribution-requests/api/query-keys.ts`, `src/modules/contribution-requests/api/queries/use-application-query.ts`, and `src/modules/contribution-requests/api/mutations/use-report-decision-feedback-mutation.ts`
- [x] T008 Harden accept/decline cache updates for queue, Request, and Application detail in `src/modules/contribution-requests/api/mutations/use-accept-application-mutation.ts` and `src/modules/contribution-requests/api/mutations/use-decline-application-mutation.ts`
- [x] T009 Implement stable status, timing, and error presentation in `src/modules/contribution-requests/constants/application-copy.ts` and `src/modules/contribution-requests/utils/application-presenter.ts`

**Checkpoint**: The typed service seam matches the backend and foundational
tests pass.

---

## Phase 3: User Story 1 - Review every pending Application (Priority: P1) 🎯 MVP

**Goal**: Give an owner a complete oldest-first, assessment-independent queue
with the evidence and timing needed to review each Application.

**Independent Test**: Render pending Applications with absent, long, and
limited context; confirm all are visible with approach, duration, profile,
fixed evidence, reminder/overdue text, and an honest empty state.

### Tests for User Story 1

- [x] T010 [US1] Add failing queue content, ordering-preservation, empty, aging, evidence-limit, and non-color-only cases in `src/modules/contribution-requests/components/owner-application-review.test.tsx`

### Implementation for User Story 1

- [x] T011 [US1] Build the responsive owner queue and evidence presentation in `src/modules/contribution-requests/components/owner-application-review.tsx`
- [x] T012 [US1] Compose the queue into all applicable owner Request lifecycle states in `src/modules/contribution-requests/components/contribution-request-detail-view.tsx`
- [x] T013 [US1] Export the review surface and supporting public API from `src/modules/contribution-requests/index.ts`

**Checkpoint**: User Story 1 works without any assessment or decision
implementation.

---

## Phase 4: User Story 2 - Accept or decline as a human owner (Priority: P1)

**Goal**: Complete explicit, assessment-independent accept and decline flows
with consequence confirmation, required feedback, focus safety, idempotency,
and conflict refresh.

**Independent Test**: Accept and decline pending fixture Applications without
assessment data, then exercise cancel, blank feedback, recoverable failure, and
terminal conflict states.

### Tests for User Story 2

- [x] T014 [P] [US2] Add failing acceptance consequence, keyboard focus, cancel, pending, and success cases in `src/modules/contribution-requests/components/accept-application-dialog.test.tsx`
- [x] T015 [P] [US2] Add failing required-feedback, preservation, keyboard focus, pending, and success cases in `src/modules/contribution-requests/components/decline-application-dialog.test.tsx`
- [x] T016 [US2] Extend owner review tests for decision availability without assessment, mutation failure, stable conflict refresh, and prohibited AI-gating copy in `src/modules/contribution-requests/components/owner-application-review.test.tsx`

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement the accessible acceptance confirmation in `src/modules/contribution-requests/components/accept-application-dialog.tsx`
- [x] T018 [P] [US2] Implement the accessible decline-feedback confirmation in `src/modules/contribution-requests/components/decline-application-dialog.tsx`
- [x] T019 [US2] Integrate idempotent human decisions, announcements, focus restoration, and conflict refresh in `src/modules/contribution-requests/components/owner-application-review.tsx`

**Checkpoint**: Owners can decide every pending Application without assessment
data, and stale decisions recover safely.

---

## Phase 5: User Story 3 - Understand terminal outcomes without stigma (Priority: P1)

**Goal**: Give contributors distinct, neutral outcome explanations and a
factual moderation-report path for explicit decline feedback.

**Independent Test**: Render all six terminal statuses and pending state, then
submit and duplicate a decline-feedback report; verify neutral effects, privacy,
focus, and no appeal promise.

### Tests for User Story 3

- [x] T020 [P] [US3] Add failing status, Owner Decision, Assignment, neutral-effect, loading, and error cases in `src/modules/contribution-requests/components/application-status-view.test.tsx`
- [x] T021 [P] [US3] Add failing report validation, focus, success, duplicate, and no-appeal-copy cases in `src/modules/contribution-requests/components/report-decision-feedback-dialog.test.tsx`
- [x] T022 [P] [US3] Add failing Application route helper cases in `src/config/routes.config.test.ts`

### Implementation for User Story 3

- [x] T023 [P] [US3] Implement the accessible feedback-report dialog in `src/modules/contribution-requests/components/report-decision-feedback-dialog.tsx`
- [x] T024 [US3] Implement the contributor Application detail and outcome surface in `src/modules/contribution-requests/components/application-status-view.tsx`
- [x] T025 [US3] Add the typed route helper and thin authenticated contributor route in `src/config/routes.config.ts` and `src/routes/_appLayout/applications.$applicationId.tsx`
- [x] T026 [US3] Export contributor status, query, report mutation, and contract types from `src/modules/contribution-requests/index.ts`

**Checkpoint**: Every supported contributor outcome is distinct and reporting
does not imply appeal or reopen the Application.

---

## Phase 6: Polish and cross-cutting validation

**Purpose**: Prove the three stories work together and meet the delivery bar.

- [x] T027 [P] Update `src/modules/contribution-requests/README.md` with the owner-decision and contributor-outcome boundaries
- [x] T028 Run the local design detector on changed UI files and fix relevant accessibility, hierarchy, or anti-pattern findings
- [x] T029 Regenerate `src/routeTree.gen.ts`, then run focused tests, full lint, full tests, and production build
- [x] T030 Exercise `specs/006-human-application-decisions/quickstart.md` at mobile, tablet, desktop, 200% zoom, RTL, dark theme, keyboard, and reduced motion where the local runtime permits
- [x] T031 Review the complete intended diff, confirm `package-lock.json` remains unrelated/uncommitted, and verify no prohibited AI-gating or private-data leakage was introduced
- [x] T032 Commit semantically, push `006-human-decisions`, verify the remote SHA, and open a pull request targeting `master`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** has no dependencies.
- **Phase 2** depends on the baseline and blocks every user story.
- **Phase 3 / US1** depends on Phase 2.
- **Phase 4 / US2** depends on the owner queue from US1 for integration, while
  its two dialog components can be developed independently after Phase 2.
- **Phase 5 / US3** depends only on Phase 2 and is independently testable.
- **Phase 6** depends on all selected stories.

### User Story Dependencies

```text
Contract foundation
├── US1 owner queue ──> US2 owner decisions
└── US3 contributor outcomes
```

### Within Each User Story

- Add failing tests before implementation.
- Keep models/types before services and services before React consumers.
- Complete the independent-test checkpoint before marking the story done.
- Files shared by multiple tasks are edited sequentially.

### Parallel Opportunities

- T003 and T004 can run in parallel.
- T014 and T015 can run in parallel.
- T020, T021, and T022 can run in parallel.
- T023 can proceed in parallel with T024 after the report contract is ready.
- T027 can proceed independently during final validation.

---

## Parallel Examples

### User Story 2

```text
T014: Test the acceptance dialog consequence and focus behavior.
T015: Test decline feedback validation and focus behavior.
```

### User Story 3

```text
T020: Test contributor status presentation.
T021: Test feedback-report interaction.
T022: Test the Application route helper.
```

---

## Implementation Strategy

### MVP first

1. Complete setup and contract foundation.
2. Deliver US1 so owners can see every pending Application.
3. Validate the queue independently before enabling decisions.

### Complete issue delivery

1. Add US2 human decisions to the proven queue.
2. Add US3 contributor outcomes and moderation reporting.
3. Run the complete quickstart and repository gates.
4. Push only the focused branch and open the PR to `master`.

## Format Validation

All 32 tasks use the required checkbox, sequential ID, optional `[P]`, required
user-story label inside story phases, and concrete file paths.
