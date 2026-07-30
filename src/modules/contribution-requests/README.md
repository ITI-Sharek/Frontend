# Contribution Requests frontend module

This module integrates the owner Contribution Request lifecycle delivered by
backend issues #48 (private draft) and #49 (publish/discover/cancel), plus the
owner Project workspace list (Frontend issue #4). New code uses the canonical
term **Contribution Request**.

Implemented routes:

```text
/my-projects/:projectId/contribution-requests
/my-projects/:projectId/contribution-requests/new
/contribution-requests/:requestId
```

The feature owns typed DTO parsing, service calls, query/mutation hooks, form
validation, command idempotency, localized stable-error copy, create/edit UI,
and explicit publish/discard/cancel confirmation. Owner identity is never
included in a request payload; the backend derives it from the authenticated
session. Recoverable API failures keep draft input mounted, while lifecycle
dialogs trap keyboard focus, close with Escape, and move focus to the updated
server-authoritative lifecycle summary after a successful command.

The Project management route supplies the known Project context. Creation is
available only for an owned Project whose `GET /projects/me` status is
`published`. The owner workspace list (`GET /projects/:projectId/contribution-requests`)
groups every lifecycle state — including drafts, published, assigned,
completed, cancelled, and discarded — and remains readable for an owned
archived Project so history is never hidden.

Application, Advisory Fit Assessment, and Contribution Proposal UI are
separate, later Sprint 4 tickets (see `specs/005-sprint-4-contribution-experience`)
and are out of scope for this module today.

Focused verification:

```bash
npm test -- --run src/modules/contribution-requests src/routes/_appLayout/contribution-request-owner-routes.test.ts
```
