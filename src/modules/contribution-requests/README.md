# Contribution Requests frontend module

This module integrates the private owner draft lifecycle delivered by backend
issue #48. New code uses the canonical term **Contribution Request**.

Implemented routes:

```text
/my-projects/:projectId/contribution-requests/new
/contribution-requests/:requestId
```

The feature owns typed DTO parsing, service calls, query/mutation hooks, form
validation, command idempotency, localized stable-error copy, create/edit UI,
and terminal discard confirmation. Owner identity is never included in a
request payload; the backend derives it from the authenticated session.

The Project management route supplies the known Project context. Creation is
available only for an owned Project whose `GET /projects/me` status is
`published`. There is deliberately no draft-list query because the backend has
not provided one.

Backend issues #47 and #49 remain prerequisites for publication, public
discovery, cancellation, and Application effects. This module must not expose
those controls until the corresponding backend contract exists.
