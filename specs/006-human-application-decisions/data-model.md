# Data Model: Human Application Decisions

The frontend does not own persistence. These models describe the
server-authoritative projections and client-only state consumed by the feature.

## Application

| Field | Meaning | Validation / presentation |
|---|---|---|
| `id` | Immutable Application identifier | Technical LTR text |
| `contributionRequestId` | Parent Contribution Request | Used for scoped cache invalidation |
| `contributor` | ID, username, display name | Username is isolated LTR |
| `profileContext` | Fixed bio, availability, experience, fields, declared skills | Missing optional values use honest empty copy |
| `contributionApproach` | Contributor-authored approach | Nullable in transport; long text wraps |
| `proposedDeliveryDurationDays` | Contributor commitment | Nullable legacy-safe value; never confused with target date |
| `status` | Current Application outcome | Explicit text and icon; never color only |
| `requirementSnapshot` | Fixed Required and Preferred Requirements | Required and Preferred remain separate |
| `evidenceSummary` | Fixed authorized skill summaries and limitations | No private source expansion or live profile fetch |
| `submittedAt` | Server submission timestamp | Oldest-first order comes from backend |
| `reviewDueAt` | Server review timing | May be null |
| `expiresAt` | Server expiry timing | May be null |
| `expiredAt` | Actual expiry timestamp | Non-null only after expiry |
| `overdue` | Server-authoritative pending-review flag | Never calculated by the client |
| `ownerDecision` | Immutable accept/decline record | Nullable; feedback only for decline |
| `assignment` | Assignment created on acceptance | Nullable |

### State transitions presented

```text
PENDING_OWNER_REVIEW
├── owner accepts ───────────────> ACCEPTED + Assignment
├── owner declines ──────────────> DECLINED_BY_OWNER + Owner Decision
├── contributor withdraws ───────> WITHDRAWN
├── sibling accepted ────────────> NOT_SELECTED
├── review window expires ───────> EXPIRED
└── Request cancelled ───────────> REQUEST_CANCELLED
```

The frontend initiates only the owner accept/decline commands in this feature.
It renders every resulting state but never manufactures a transition.

## Owner Decision

| Field | Meaning |
|---|---|
| `id` | Immutable decision identifier |
| `applicationId` | Decided Application |
| `contributionRequestId` | Parent Request |
| `decisionType` | `ACCEPTED` or `DECLINED` |
| `feedback` | Required trimmed human feedback for decline; null for acceptance |
| `decidedAt` | Server decision timestamp |

## Assignment

| Field | Meaning |
|---|---|
| `id` | Immutable Assignment identifier |
| `applicationId` | Accepted Application |
| `ownerDecisionId` | Acceptance decision |
| `contributionRequestId` | Assigned Request |
| `contributorId` | Selected contributor |
| `agreedDeliveryDurationDays` | Accepted proposed duration |
| `agreedDeliveryDueDate` | Server-derived due date |
| `assignedAt` | Acceptance timestamp |

## Decision Feedback Report

| Field | Meaning | Validation |
|---|---|---|
| `ownerDecisionId` | Explicit decline being reported | Must belong to current contributor |
| `reason` | Moderation category | One backend-supported enum value |
| `description` | Factual report detail | Trimmed, 10–2000 characters |
| `status` | Moderation workflow state | Does not change Application status |

## Client-only UI state

- Selected/open Application row
- Accept/decline/report dialog visibility
- Decline feedback value and field error
- Report reason, description, and field error
- Mutation announcement and trigger to restore focus to
- One idempotency key per logical accept or decline attempt, reused on retry
