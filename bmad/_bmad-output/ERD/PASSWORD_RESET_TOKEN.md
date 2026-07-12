# Entity: PASSWORD_RESET_TOKEN

> Added 2026-07-12 by approved decision DEC-012 (`docs/governance/decision-log.md`).

## Description
Single-use, short-lived token supporting the forgot-password flow (`POST /auth/forgot-password` → email link → `POST /auth/reset-password`). Only the token **hash** is stored.

## Attributes

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | UUID | PK | Unique identifier |
| `user_id` | UUID | FK → USER.id, NOT NULL | Token owner |
| `token_hash` | VARCHAR | UNIQUE, NOT NULL | Hash of the opaque one-time token (raw token never stored) |
| `expires_at` | TIMESTAMP | NOT NULL | 15–30 minutes after creation |
| `consumed_at` | TIMESTAMP | NULLABLE | Set on successful reset (single-use) |
| `revoked_at` | TIMESTAMP | NULLABLE | Set when superseded by a newer token or invalidated |
| `requested_ip` | VARCHAR | NULLABLE | For rate limiting / audit |
| `created_at` | TIMESTAMP | NOT NULL | Created |

## Business Rules

1. **Non-enumeration**: the request endpoint returns the identical response whether the email exists or not.
2. **Single use**: consumed tokens are dead; successful reset revokes all other active tokens for the user.
3. **Session invalidation**: successful reset revokes existing AUTH_SESSIONs.
4. **Rate limiting**: by IP and normalized email.
5. **Audit**: password-reset request and completion each record an audit event.

## Decision: DEC-012
