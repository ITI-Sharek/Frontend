# Feature Specification: Human Application Decisions

**Feature Branch**: `006-human-decisions`

**Created**: 2026-07-30

**Status**: Ready

**Input**: GitHub issue #6, `[S4-F04] Review Applications and make human decisions`

**Shared product contract**: `DEC-004`, `DEC-005`, `DEC-030`, `DEC-034`,
`DEC-035`, `DEC-036`, ADR 0002, and Sprint 4 User Story 4.6.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review every pending Application (Priority: P1)

As a Project owner, I want one decision queue containing every pending
Application for my Contribution Requests so I can inspect each contributor's
approach, proposed duration, profile context, fixed evidence summary, and
waiting state without an AI filter.

**Why this priority**: A complete, assessment-independent queue is the minimum
surface required for an owner to make a human selection decision.

**Independent Test**: Open an owned Contribution Request with multiple pending
Applications and verify that every Application is visible, ordered consistently,
and exposes the context and aging information needed to review it.

**Acceptance Scenarios**:

1. **Given** an owned Contribution Request with pending Applications, **When**
   the owner opens its Application review surface, **Then** every pending
   Application is listed regardless of assessment state.
2. **Given** a pending Application, **When** the owner expands or opens it,
   **Then** the Contribution Approach, Proposed Delivery Duration, contributor
   profile context, fixed evidence summary, submitted time, review timing, and
   reminder or overdue state are available.
3. **Given** a queue with no pending Applications, **When** the owner opens it,
   **Then** the page explains that no decision is currently needed and provides
   a useful route back to the Contribution Request.

---

### User Story 2 - Accept or decline as a human owner (Priority: P1)

As a Project owner, I want to accept or decline any pending Application without
waiting for an Advisory Fit Assessment so that selection remains my explicit
human responsibility.

**Why this priority**: The core Sprint 4 contract requires decisions to remain
available when assessment is absent, pending, limited, failed, or unavailable.

**Independent Test**: From a pending Application, accept once and decline once
using separate fixtures; verify the confirmation, feedback, resulting status,
and conflict recovery without requesting an assessment.

**Acceptance Scenarios**:

1. **Given** a pending Application in any supported assessment state, **When**
   the owner reviews it, **Then** both accept and decline actions remain
   available.
2. **Given** an owner chooses accept, **When** the confirmation is presented,
   **Then** it states that one Assignment will be created and sibling pending
   Applications will become `NOT_SELECTED`.
3. **Given** an owner confirms acceptance, **When** the decision succeeds,
   **Then** the accepted state and Assignment outcome are shown and stale queue
   data is no longer presented.
4. **Given** an owner chooses decline, **When** feedback is missing or blank,
   **Then** the decision is not submitted and a correction is explained at the
   feedback field.
5. **Given** valid decline feedback, **When** the owner confirms decline,
   **Then** the Application becomes `DECLINED_BY_OWNER` and the human feedback
   remains visually separate from any AI findings.
6. **Given** another actor or expiry wins a decision race, **When** the owner's
   action returns a stable conflict or terminal-state outcome, **Then** the
   owner sees an honest explanation and refreshed server-authoritative state
   without a duplicate decision.

---

### User Story 3 - Understand terminal outcomes without stigma (Priority: P1)

As a contributor, I want each terminal Application outcome explained distinctly
so I understand what happened, what it does not affect, and whether I can report
inappropriate owner feedback.

**Why this priority**: Consequential owner decisions must remain transparent,
neutral, and safe for the contributor affected by them.

**Independent Test**: Render each supported terminal status and verify its
distinct explanation, neutral-effect statement, available next action, and
feedback-reporting behavior.

**Acceptance Scenarios**:

1. **Given** an Application is `NOT_SELECTED`, `DECLINED_BY_OWNER`, `EXPIRED`,
   `WITHDRAWN`, or `REQUEST_CANCELLED`, **When** the contributor opens its
   status, **Then** the outcome has distinct non-stigmatizing copy and is not
   represented by color alone.
2. **Given** an outcome has no profile, eligibility, or reputation effect,
   **When** it is displayed, **Then** that neutral effect is stated explicitly.
3. **Given** a contributor received an explicit owner decline with feedback,
   **When** they report abusive or inappropriate feedback, **Then** the
   moderation action is described as a report rather than an appeal and the
   Application remains closed.
4. **Given** a duplicate report or reporting error, **When** submission fails,
   **Then** the contributor receives a specific recoverable explanation without
   any promise that the Owner Decision will be reopened.

### Edge Cases

- An Application becomes terminal between opening the confirmation and
  submitting the decision.
- A Contribution Request is cancelled or assigned while the owner is reviewing
  its queue.
- Review timing is missing, exactly on the day-3 reminder boundary, on the
  day-5 overdue boundary, or already beyond the day-7 expiry boundary.
- The queue contains long approaches, long technical identifiers, missing
  optional profile fields, or no approved evidence summaries.
- An assessment is absent, queued, running, limited, failed, unavailable, or
  completed; none of these states may gate owner actions.
- Network or authorization failure occurs after the owner enters decline
  feedback; the entered feedback remains recoverable.
- Multiple sibling Applications change to `NOT_SELECTED` after acceptance.
- The owner or contributor uses keyboard-only navigation, 200% zoom, a narrow
  viewport, dark theme, Arabic RTL, or reduced-motion preferences.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The owner review surface MUST list every server-authorized
  `PENDING_OWNER_REVIEW` Application without filtering by assessment state.
- **FR-002**: Each pending Application MUST expose Contribution Approach,
  Proposed Delivery Duration, contributor profile context, fixed evidence
  summary, submission time, and server-provided review timing.
- **FR-003**: Reminder, overdue, and expiry-related presentation MUST derive
  from server-authoritative state and MUST communicate meaning with text rather
  than color alone.
- **FR-004**: Accept and decline MUST remain available when an assessment is
  absent, queued, running, limited, failed, unavailable, or complete.
- **FR-005**: Acceptance MUST require an explicit confirmation that one
  Assignment will be created and sibling pending Applications will become
  `NOT_SELECTED`.
- **FR-006**: Decline MUST require non-blank owner feedback and MUST keep that
  human feedback visibly separate from Advisory Fit findings.
- **FR-007**: Successful decisions MUST refresh affected Application,
  Contribution Request, and owner-queue state so stale actions are removed.
- **FR-008**: Stable terminal, cancellation, authorization, idempotency, and
  conflict outcomes MUST have distinct explanations and recovery behavior.
- **FR-009**: Contributor-facing status MUST distinguish `ACCEPTED`,
  `DECLINED_BY_OWNER`, `NOT_SELECTED`, `EXPIRED`, `WITHDRAWN`, and
  `REQUEST_CANCELLED`.
- **FR-010**: Neutral terminal outcomes MUST state when they do not affect the
  contributor's profile, eligibility, reputation, or other Applications.
- **FR-011**: A contributor affected by an explicit owner decline MUST be able
  to report inappropriate decision feedback using factual moderation language
  that does not imply an appeal or automatic reversal.
- **FR-012**: Decision confirmations and report dialogs MUST restore or move
  focus predictably, support keyboard completion, and announce validation and
  result states.
- **FR-013**: The workflow MUST preserve functional and content parity across
  supported themes, Arabic RTL and English LTR, and responsive layouts.
- **FR-014**: The interface MUST NOT introduce assessment scores, rankings,
  pass/fail labels, eligibility verdicts, Application quotas, or decision
  recommendations.
- **FR-015**: Owner-only and contributor-only information MUST remain scoped to
  the authorized audience; public Request views MUST NOT receive private
  Applications, evidence summaries, owner feedback, or decision reports.

### Key Entities

- **Application Review Item**: An authorized pending Application with its
  approach, proposed duration, contributor context, fixed evidence summary,
  submitted time, review timing, and current assessment presentation state.
- **Owner Decision**: The immutable human accept or decline outcome, including
  owner feedback only for a decline.
- **Assignment**: The active relationship created by accepting one Application
  for a Contribution Request.
- **Application Outcome**: The server-authoritative current status and its
  contributor-safe explanation.
- **Decision Feedback Report**: A moderation report linked to an explicit owner
  decline; it does not reopen or change the Application.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In fixture and smoke scenarios, 100% of pending Applications are
  visible to the authorized owner regardless of assessment state.
- **SC-002**: An owner can reach either decision action from the queue and
  complete a valid accept or decline flow without requesting an assessment.
- **SC-003**: Every acceptance attempt presents the Assignment and sibling
  `NOT_SELECTED` consequence before the irreversible action is submitted.
- **SC-004**: All six supported contributor outcomes render distinct text and
  any neutral effect on profile, eligibility, or reputation is explicit.
- **SC-005**: Stable conflict and terminal-state responses remove stale
  decision affordances after refresh and never create a duplicate visible
  outcome.
- **SC-006**: Keyboard-only users can open, complete, cancel, and recover from
  every confirmation and reporting flow with visible focus.
- **SC-007**: Automated checks cover decision availability across assessment
  states, aging boundaries, conflict handling, terminal copy, report behavior,
  and the absence of prohibited AI-gating language.
- **SC-008**: The workflow passes repository lint, tests, production build, and
  responsive/RTL visual inspection with no critical accessibility defects.

## Assumptions

- Backend issue B05 exposes owner list/detail/accept/decline contracts and
  contributor-visible immutable decision and Assignment projections.
- Backend issue B06 owns reminder, overdue, and expiry transitions; the
  frontend displays server-provided timing and does not run a scheduler.
- Authentication, Project ownership, and contextual authorization use existing
  app infrastructure; the backend remains the final authority.
- Advisory Fit Assessment creation and detailed finding presentation belong to
  S4-F05. This feature may show assessment availability/state only to prove it
  never gates decisions.
- Application submission and withdrawal belong to S4-F03. This feature adds
  the owner review and contributor outcome surfaces that consume those records.
- The approved Registry design system, existing localized shell, and current
  component vocabulary remain authoritative.
