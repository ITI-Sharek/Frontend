# Contribution Proposals

This feature owns the private, contributor-authored proposal workflow. It is deliberately separate from Applications: submitting a proposal has no application quota, fit gate, Assignment, or selection priority.

The module mirrors the backend `/contribution-proposals` contract:

- contributors submit a disclosure-backed proposal, see only their proposals, append an immutable version after an owner revision request, and may withdraw only a pending proposal;
- project owners see proposals for their own project, request a revision, decline with a reason, or accept the latest contributor version into an attributed owner draft;
- both authorized parties see the private chronological history and may create a factual misuse report without changing proposal state;
- only a published resulting Contribution Request is linked to contributors. Private owner draft state and unfinished owner fields are never rendered.

Routes compose this module with Projects and Contribution Requests. Feature code must not import either module directly.
