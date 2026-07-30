# Application Review API Contract

All routes require the existing bearer-authenticated session. Dates arrive as
ISO JSON strings even though the NestJS source DTO uses `Date`.

## List pending Applications for an owner

```http
GET /tasks/:contributionRequestId/applications
```

```json
{
  "applications": [
    {
      "id": "uuid",
      "contributionRequestId": "uuid",
      "contributor": {
        "id": "uuid",
        "username": "sara",
        "displayName": "Sara Ahmed"
      },
      "profileContext": {
        "bio": "Backend contributor",
        "availability": "10 hours per week",
        "experienceLevel": {
          "key": "intermediate",
          "labelEn": "Intermediate",
          "labelAr": "متوسط"
        },
        "fields": [],
        "declaredSkills": ["NestJS"]
      },
      "contributionApproach": "I will implement and test the workflow.",
      "proposedDeliveryDurationDays": 5,
      "status": "PENDING_OWNER_REVIEW",
      "requirementSnapshot": {
        "required": [],
        "preferred": []
      },
      "evidenceSummary": [],
      "submittedAt": "2026-07-28T10:00:00.000Z",
      "reviewDueAt": "2026-07-31T10:00:00.000Z",
      "expiresAt": "2026-08-04T10:00:00.000Z",
      "expiredAt": null,
      "overdue": false,
      "ownerDecision": null,
      "assignment": null
    }
  ]
}
```

Backend order is oldest submission first, then ID. The frontend does not filter
by assessment state.

## Read one Application for its contributor or current Project owner

```http
GET /applications/:applicationId
```

Returns one `ApplicationDto` with nullable `ownerDecision` and `assignment`.

## Accept an Application

```http
POST /applications/:applicationId/accept
Idempotency-Key: <uuid>
```

No request body.

```json
{
  "application": { "status": "ACCEPTED" },
  "ownerDecision": {
    "id": "uuid",
    "decisionType": "ACCEPTED",
    "feedback": null
  },
  "assignment": {
    "id": "uuid",
    "agreedDeliveryDurationDays": 5,
    "agreedDeliveryDueDate": "2026-08-04T10:00:00.000Z"
  }
}
```

Acceptance creates one Assignment and changes sibling pending Applications to
`NOT_SELECTED`.

## Decline an Application

```http
POST /applications/:applicationId/decline
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "feedback": "The approach needs a more concrete test strategy."
}
```

Feedback is trimmed, required, and at most 2000 characters. The response is an
`OwnerDecisionResultDto` whose `assignment` is `null`.

## Report inappropriate decline feedback

```http
POST /owner-decisions/:ownerDecisionId/reports
Content-Type: application/json

{
  "reason": "harassment",
  "description": "The decline feedback contains abusive language."
}
```

Supported reasons are `fraud`, `misuse`, `reputation_manipulation`,
`inaccurate_ai`, `harassment`, and `other`. Description is 10–2000 trimmed
characters. Success creates a moderation report and does not reopen or change
the Application.

## Stable errors used by the UI

- `APPLICATION_DECISION_FEEDBACK_REQUIRED`
- `APPLICATION_TERMINAL`
- `REQUEST_CANCELLED`
- `REQUEST_TERMINAL`
- `APPLICATION_NOT_AUTHORIZED`
- `APPLICATION_IDEMPOTENCY_KEY_REQUIRED`
- `APPLICATION_IDEMPOTENCY_CONFLICT`
- `APPLICATION_CONCURRENT_MODIFICATION`
- `OWNER_DECISION_REPORT_ALREADY_EXISTS`

The UI branches only on stable `code` values and uses generic safe recovery for
unknown/network failures.
