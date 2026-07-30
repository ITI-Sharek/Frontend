# Contribution Requests frontend module

This module integrates the owner Contribution Request lifecycle delivered by
backend issues #48 (private draft) and #49 (publish/discover/cancel), plus the
owner Project workspace list (Frontend issue #4), Application owner decisions
(backend #51), and the review window (backend #52 / Frontend #6). New code uses
the canonical terms **Contribution Request**, **Application**, **Owner
Decision**, and **Assignment**.

Implemented routes:

```text
/my-projects/:projectId/contribution-requests
/my-projects/:projectId/contribution-requests/new
/contribution-requests/:requestId
/applications/:applicationId
```

The feature owns typed DTO parsing, service calls, query/mutation hooks, form
validation, command idempotency, localized stable-error copy, create/edit UI,
and explicit publish/discard/cancel confirmation. Owner identity is never
included in a request payload; the backend derives it from the authenticated
session. Recoverable API failures keep draft input mounted, while lifecycle
dialogs trap keyboard focus, close with Escape, and move focus to the updated
server-authoritative lifecycle summary after a successful command.

The owned Contribution Request detail also lists every backend-authorized
`PENDING_OWNER_REVIEW` Application oldest-first. Each record presents the
Contribution Approach, Proposed Delivery Duration, fixed contributor/profile
context, fixed evidence summaries and limitations, and the server-provided
review timing. Accept and decline remain available without an Advisory Fit
Assessment and while later assessment work is pending, limited, failed, or
unavailable. Acceptance confirms that one Assignment is created and pending
siblings become `NOT_SELECTED`; decline requires human feedback and keeps it
visually separate from AI findings. Both commands send an `Idempotency-Key` and
refresh server state after terminal or concurrent races.

The contributor Application detail route distinguishes `ACCEPTED`,
`DECLINED_BY_OWNER`, `NOT_SELECTED`, `EXPIRED`, `WITHDRAWN`, and
`REQUEST_CANCELLED`, including neutral profile/eligibility/reputation effects.
An explicit owner decline can be reported for moderation through the immutable
Owner Decision ID. Reporting is never labeled as an appeal and does not reopen
the Application.

The Project management route supplies the known Project context. Creation is
available only for an owned Project whose `GET /projects/me` status is
`published`. The owner workspace list (`GET /projects/:projectId/contribution-requests`)
groups every lifecycle state — including drafts, published, assigned,
completed, cancelled, and discarded — and remains readable for an owned
archived Project so history is never hidden.

Application submission/withdrawal, Advisory Fit Assessment presentation, and
Contribution Proposal UI remain separate Sprint 4 tickets (see
`specs/005-sprint-4-contribution-experience`). Assessment data must never become
a predicate for the human decisions implemented here.

Focused verification:

```bash
npx vitest run src/modules/contribution-requests src/config/routes.config.test.ts
```
