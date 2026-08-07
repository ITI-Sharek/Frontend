# Materials module

Upload, share, version, and delete Project and Contribution Request documents.

## The rule that shapes everything here

**Upload is storage consent, not AI-processing consent.** This surface offers
no analysis action, no "select for analysis", and no suggestion — and it must
stay that way. The separation the backend enforces is only credible if the UI
never quietly offers the next step. Choosing documents for analysis is a
different surface (Frontend #11), reached from somewhere else.

`materials-panel.interaction.test.tsx` asserts this by scanning every rendered
button label, so the rule fails loudly rather than eroding.

## States are server-authoritative

`utils/material-state.ts` derives one state per version from server fields
only. Nothing is inferred from elapsed time or from a missing field.

| State | Meaning |
|---|---|
| `UPLOADING` | client-owned, while the request is in flight |
| `QUARANTINED` | stored, waiting on the scan worker |
| `SCANNING` | being scanned now |
| `SCAN_UNAVAILABLE` | retried to the limit, never got a verdict |
| `READY` | cleared — the only downloadable state |
| `REJECTED` | malware found |
| `PURGE_PENDING` | deleted, content still being destroyed |
| `DELETED` | deleted and purged |

**`SCAN_UNAVAILABLE` is deliberately not a flavour of `REJECTED`.** Both are
undownloadable, but one means the file was found to be malware and the other
means we never managed to check it. Telling an owner the first when the second
is true is an accusation. It is derived from `scanErrorCode`, which the backend
added for exactly this.

**Deletion outranks scan status.** A deleted Material's newest version still
reads `READY` from the server, so keying on `scanStatus` alone would offer a
file whose bytes are already gone.

Every state carries a label *and* a full description, both rendered as text.
Colour is never the only signal.

## Downloads

Two calls, matching the server: mint a short-lived token, then redeem it. A
plain `<a href>` cannot do the second — the redemption route sits behind the
access guard and needs the bearer token, which a browser navigation would not
send. The bytes are fetched and handed to a generated object URL, which is
revoked immediately: an un-revoked URL pins its blob for the life of the
document, and a Materials list is exactly where someone downloads a dozen files
without navigating away.

A non-`READY` version renders a **disabled** control with a stated reason, not
an absent one. A control that is merely greyed out tells a keyboard or
screen-reader user nothing about what would change it.

## Limits come from the server

`GET /material-upload-constraints` supplies the format allowlist and size
ceiling. They are never duplicated in the client, so raising the ceiling in
backend config cannot leave the form advertising the old number. An
unrecognised MIME type is shown as itself rather than dropped.

Client-side size and type checks mirror the server's and never replace them:
they exist to spare a 25 MB upload that was always going to be refused.

## Idempotency keys

Bare UUID v4, from `utils/material-idempotency.ts`. **Not** the shared
`ContributionRequestIdempotencyKeyStore`, whose generator returns `cr-<uuid>` —
every Material command validates with `@IsUUID('4')`, so the prefix that is
harmless elsewhere is rejected here.

## Polling

The list polls only while a version is genuinely waiting on the scan worker,
which has no push channel. An abandoned scan is treated as settled: polling it
can only ever return the same row.
