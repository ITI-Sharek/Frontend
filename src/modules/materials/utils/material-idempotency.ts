/**
 * A bare UUID v4, with no prefix.
 *
 * Deliberately not reusing `ContributionRequestIdempotencyKeyStore`, whose
 * generator returns `cr-<uuid>`. Every Material command validates its key with
 * `@IsUUID('4')`, so a prefixed key is rejected as malformed before the command
 * is ever read — the prefix that is harmless there is fatal here.
 */
export function createMaterialIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}
