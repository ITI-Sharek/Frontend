# Quickstart: Validate Human Application Decisions

## Prerequisites

- Backend running with Sprint 4 Application/Owner Decision migrations applied
- Frontend `.env` points `VITE_API_URL` to that backend
- One active Project owner with an owned Contribution Request
- At least two pending Applications from active contributors
- One declined Application with contributor-visible Owner Decision feedback

## Automated validation

```bash
npm run generate-routes
npm run lint
npm test
npm run build
```

Focused checks while iterating:

```bash
npx vitest run src/modules/contribution-requests
npx vitest run src/config/routes.config.test.ts
```

## Owner queue scenario

1. Sign in as the current Project owner.
2. Open the owned Contribution Request detail.
3. Confirm every pending Application appears oldest-first.
4. Confirm each row exposes the approach, proposed duration, contributor
   context, fixed evidence/limitations, and review timing.
5. Confirm no assessment state hides or disables accept/decline.
6. Verify empty evidence and long content remain readable.

Expected: the owner has a complete, contextual, assessment-independent queue.

## Acceptance scenario

1. Open one pending Application and choose accept.
2. Verify the confirmation says one Assignment is created and sibling pending
   Applications become `NOT_SELECTED`.
3. Cancel with Escape and verify focus returns to the accept trigger.
4. Reopen, confirm, and verify the queue/detail refresh.

Expected: the selected Application is accepted, stale decision controls
disappear, and sibling items no longer remain in the pending queue.

## Decline scenario

1. Choose decline on another pending Application.
2. Attempt to submit blank feedback.
3. Enter valid feedback and submit.
4. Simulate a network failure, retry, and verify the same logical idempotency
   key is reused.

Expected: validation is associated with the feedback field, entered text
survives recoverable failure, and success removes stale actions.

## Conflict scenario

1. Open an Application decision dialog.
2. In another session, decide or expire that Application.
3. Submit the stale dialog.

Expected: stable conflict copy explains the state changed, refreshes the
server-authoritative Application/queue, and does not present duplicate success.

## Contributor outcome scenario

For `ACCEPTED`, `DECLINED_BY_OWNER`, `NOT_SELECTED`, `EXPIRED`, `WITHDRAWN`,
and `REQUEST_CANCELLED`:

1. Sign in as the applying contributor.
2. Open `/applications/:applicationId`.
3. Verify distinct text, icon, next action, and non-color-only state.
4. Verify neutral outcomes explicitly state no profile, eligibility, or
   reputation effect where applicable.
5. For an explicit decline, verify human feedback is separate and the report
   dialog says moderation report, not appeal.
6. Submit once, then exercise duplicate-report handling.

## Responsive and accessibility matrix

Inspect owner and contributor states at:

- 320px and 393px mobile widths
- 768px tablet width
- 1440px desktop width
- 200% browser zoom
- light and dark themes
- Arabic RTL and technical LTR-isolated values
- keyboard only and reduced-motion preference

Check no horizontal page overflow, visible focus, 44px primary targets,
dialog focus containment/restoration, readable status text, and no meaning
communicated by color alone.
