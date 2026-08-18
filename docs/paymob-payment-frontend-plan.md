# Paymob frontend implementation plan (PAY-05 / PAY-06)

Date: 2026-08-18
Frontend branch: `feat/paymob-checkout-activation`
Backend dependency: `feat/paymob-callback-activation`

This document is the frontend companion to the backend plan at
`../../paymob-callback-activation/docs/paymob-payment-implementation-plan.md`.
It records the user-facing checkout contract, the verification boundary, and
the remaining sandbox evidence required before enabling shared traffic.

## Outcome

PAY-05 is implemented in the frontend:

- The plan page reads the caller's role context from `GET /me/subscription`.
- Free owners and contributors can start Gold checkout with
  `POST /me/subscription/checkout`.
- Each click carries a UUID idempotency key in the request body and
  `Idempotency-Key` header. A failed network retry reuses the same attempt key.
- The browser stores only the payment ID in session storage, then navigates to
  the backend-provided HTTPS Paymob hosted checkout URL.
- `/payments/result` never trusts Paymob query parameters for entitlement. It
  polls `GET /me/payments/:paymentId` and shows activation success only for
  backend status `paid`. Pending, failed, cancelled, and refunded receive
  distinct, truthful copy; refunded does not claim entitlement revocation that
  the frontend cannot verify.
- Paid results invalidate the subscription query so the plan page immediately
  reflects the backend activation.

PAY-06 is prepared but cannot be marked provider-complete until a real sandbox
payment succeeds through the Paymob dashboard and public HTTPS webhook. Local
development may return to the loopback result page; shared sandbox, staging,
and production require an HTTPS frontend result URL. No credentials, card data,
client secrets, or HMAC values belong in source control, logs, or issue
comments.

## Contract used by the frontend

```text
POST /me/subscription/checkout
body: { planType: "gold", roleContext: "owner" | "contributor", idempotencyKey }
header: Idempotency-Key: <same UUID>
response: { paymentId, checkout: { provider: "paymob", clientSecret, checkoutUrl } }

GET /me/payments/:paymentId
response: {
  paymentId,
  planType: "gold",
  roleContext,
  amountCents,
  currency,
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded",
  createdAt,
  paidAt
}
```

The `clientSecret` is accepted as a browser-safe response field for contract
compatibility but is intentionally not logged or used by the frontend. The
hosted URL is validated as HTTPS before navigation.

## Verification completed

- Focused frontend payment tests: 4 files, 20 tests passed.
- Full frontend test suite: 137 files, 679 tests passed.
- Frontend typecheck: passed.
- Backend payment/subscription/identity regression: 25 suites, 146 tests
  passed; the complete backend suite passes with Paymob explicitly disabled
  (170 suites, 1,284 tests), and the payment migration round-trip passes against
  the local PostgreSQL service.
- Changed-file ESLint: passed. The repository-wide lint command still reports
  pre-existing errors in unrelated settings and route files; none are in the
  Paymob changes.
- Route generation: passed; `src/routeTree.gen.ts` is generated and ignored as
  required by the repository.

## PAY-06 sandbox checklist

Run only in an isolated sandbox after the backend environment has all required
Paymob values. The notification URL must be public HTTPS; the frontend result
URL must be HTTPS except for an explicitly local loopback development run:

1. `PAYMOB_NOTIFICATION_URL=https://<backend>/payments/paymob/webhook`
2. `PAYMOB_REDIRECTION_URL=https://<frontend>/payments/result`
3. The Paymob dashboard has the exact same notification and redirection URLs.
4. The configured integration ID belongs to the same sandbox account, EGP
   payment method, and sandbox/live expectation.
5. Start checkout as an owner and as a contributor; confirm role isolation.
6. Complete one sandbox success: callback verifies, status becomes `paid`, and
   exactly one 30-day Gold entitlement appears.
7. Complete one decline: status becomes `failed`, and no entitlement appears.
8. Replay the successful callback: the endpoint is idempotent and no second
   entitlement is created.
9. Send invalid HMAC, amount, currency, reference, integration, or environment
   facts: the attempt does not activate.
10. Return from checkout without a callback: the frontend remains `pending`.
11. Set `PAYMENTS_PAYMOB_ENABLED=false` and restart; checkout is unavailable.
12. Record sanitized evidence only: payment ID/status/timestamps and row
    counts, never provider credentials or raw callback secrets.

Current local verification: the provider configuration is present, the public
HTTPS callback relay reaches the local backend webhook, the loopback result URL
is configured for development, and the frontend and backend payment worktrees
are running successfully. No charge was initiated, so a completed Paymob
sandbox transaction and verified callback remain the external release gate.

## Rollback and safety

- Disable the provider with `PAYMENTS_PAYMOB_ENABLED=false` and restart the
  backend.
- Do not substitute localhost URLs for Paymob callbacks.
- Do not infer payment success from a redirect, query parameter, or client
  state; only the verified backend callback can activate Gold.
- Keep the frontend result route in the same authenticated browser session as
  checkout so its bearer-auth status request can identify the payer.
