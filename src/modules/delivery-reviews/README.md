# Delivery Reviews

Owns the Sprint 5 delivery submission and human review workflow in the client.

## Public seam

`DeliveryClient` is the feature boundary. The production adapter uses the
backend HTTP routes; interaction tests inject an in-memory adapter and exercise
the rendered contributor and owner workflows without mocking feature internals.

The module exports two route-composable panels:

- `ContributorDeliveryPanel` submits a canonical GitHub pull-request URL,
  presents the authoritative state and review history, corrects a submitted
  link before review, and resubmits requested changes as a new immutable
  version.
- `OwnerDeliveryReviewPanel` selects the accepted assignee for one Contribution
  Request, presents the pull request and requirements, and records an explicit
  approval, changes request, or rejection.

TanStack Query owns server state. Durable writes use UUIDv4 idempotency headers;
the same key is retained across retries and cleared when command content
changes or the server confirms success.
