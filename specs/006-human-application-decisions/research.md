# Research: Human Application Decisions

## Decision 1: Use the delivered NestJS contract as the integration truth

**Decision**: Model the frontend directly from
`ApplicationDto`, `OwnerApplicationsDto`, `OwnerDecisionResultDto`, and the
decision-feedback report contract in the sibling backend.

**Rationale**: The current frontend seam predates the delivered backend and
incorrectly expects an array response, snapshot IDs instead of snapshot
content, no detail endpoint, no Owner Decision projection, no `overdue` flag,
no idempotency header, and `reason` instead of `feedback`.

**Alternatives considered**:

- Preserve the existing types and adapt UI around missing data: rejected
  because it would invent or hide consequential state.
- Normalize the backend into a smaller legacy DTO: rejected because the review
  experience needs the fixed evidence, profile context, decision, Assignment,
  and review-window fields.

## Decision 2: Keep review inside the Contribution Requests module

**Decision**: Extend `src/modules/contribution-requests/`.

**Rationale**: The module already owns Contribution Request/Application
contracts, services, query keys, and decision mutations. A separate
`applications` module would create lateral imports or duplicate Request state.

**Alternatives considered**:

- Create `src/modules/applications/`: rejected for this slice because it would
  split an established feature boundary and require cross-feature coordination.
- Put queue logic in route files: rejected by the constitution.

## Decision 3: Embed the owner queue in the existing Request detail

**Decision**: Add the review surface below Request context instead of creating
an isolated owner-inbox route.

**Rationale**: The approved product direction uses contextual owner access and
explicitly rejected a generic inbox for MVP. The existing owner Request route
already establishes ownership and gives decisions the right work context.

**Alternatives considered**:

- Global owner decision dashboard: rejected as wider scope and weaker context.
- Modal-only reviewer: rejected because dense evidence and multiple
  Applications need a durable page surface.

## Decision 4: Use backend aging state, not client lifecycle inference

**Decision**: Display `reviewDueAt`, `expiresAt`, `expiredAt`, and `overdue`
exactly as returned. Date formatting is presentational only.

**Rationale**: The day-3 reminder, day-5 overdue state, and day-7 expiry are
backend-owned, idempotent workflow decisions. Client clock inference can drift
or contradict a concurrent server transition.

**Alternatives considered**:

- Calculate thresholds from `submittedAt`: rejected because the UI is not a
  scheduler or authority.
- Poll a scheduler endpoint: rejected because no public scheduler route exists.

## Decision 5: Make human decisions independent from assessments

**Decision**: Do not add an assessment field to the decision predicate. If
future S4-F05 data is composed beside the queue, accept/decline remain governed
only by `PENDING_OWNER_REVIEW` and mutation state.

**Rationale**: DEC-030 and DEC-036 make assessment optional and
decision-neutral.

**Alternatives considered**:

- Disable decisions while analysis runs: rejected as a contract violation.
- Add fit summaries now: rejected as S4-F05 scope.

## Decision 6: Use explicit dialogs with stable focus behavior

**Decision**: Use project-native dialog sections with modal semantics, initial
focus, Escape handling, focus trapping, and trigger focus restoration.

**Rationale**: Acceptance changes sibling Applications and creates an
Assignment; decline records immutable feedback. Both need deliberate
confirmation and accessible recovery consistent with existing lifecycle
dialogs.

**Alternatives considered**:

- Browser `confirm()`: rejected for inaccessible consequence hierarchy and no
  feedback validation.
- Inline one-click actions: rejected because acceptance is consequential and
  decline requires feedback.

## Decision 7: Treat moderation reporting as reporting, never appeal

**Decision**: Show reporting only for `DECLINED_BY_OWNER` with an immutable
Owner Decision and feedback. Use factual reason/description fields and preserve
the closed status after success.

**Rationale**: The backend route creates a moderation Report and explicitly
does not reopen the Application.

**Alternatives considered**:

- Generic support link: rejected because it loses the decision linkage.
- “Appeal decision” copy: rejected by the shared product contract.
