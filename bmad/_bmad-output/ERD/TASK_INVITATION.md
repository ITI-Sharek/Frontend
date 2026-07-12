# Entity: TASK_INVITATION

> Added 2026-07-12 by approved decision DEC-003 (`docs/governance/decision-log.md`).

## Description
A lightweight owner-to-contributor invitation generated from AI matching. It notifies a matched contributor about a contribution request. It is **not** an assignment and creates no application: the contributor must apply through the normal flow, and the application passes AI validation and consumes daily quota exactly like any other.

## Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `contribution_request_id` | UUID | FK → CONTRIBUTION_REQUEST.id, NOT NULL | The task being invited to (`task_id` in the decision brief) |
| `owner_id` | UUID | FK → USER.id, NOT NULL | Inviting project owner |
| `contributor_id` | UUID | FK → USER.id, NOT NULL | Invited contributor |
| `source` | ENUM | NOT NULL | `manual_match` \| `gold_auto_match` |
| `status` | ENUM | NOT NULL, DEFAULT `sent` | `sent`, `viewed`, `declined`, `expired` |
| `created_at` | TIMESTAMP | NOT NULL | When sent |
| `expires_at` | TIMESTAMP | NOT NULL | Expiry (also expires when the request closes) |

## Unique Constraint
`UNIQUE(contribution_request_id, contributor_id)` — one invitation per contributor per request.

## Relationships

| Related Entity | Relationship | Description |
|---------------|-------------|-------------|
| CONTRIBUTION_REQUEST | N:1 | Invitation targets a task |
| USER (owner) | N:1 | Sent by |
| USER (contributor) | N:1 | Sent to |

## Business Rules

1. **Not an assignment**: invitation never assigns, never creates an application, never guarantees acceptance.
2. **No bypass**: AI eligibility validation and daily application quota apply unchanged when the contributor applies.
3. **Plan gating**: manual invitations from matches — Silver (top 5) and Gold (top 10) owners; `gold_auto_match` only for Gold auto-notify on publish (FR-075).
4. **No reputation effect**: declining or ignoring an invitation never affects contributor reputation.
5. **Copy rule**: "Your verified skills appear to match this contribution request. Review the requirements and apply if interested." Never "You have been selected."
6. **Notification**: rides notification type `match_found`.

## PRD: FR-074, FR-075 · Decision: DEC-003
