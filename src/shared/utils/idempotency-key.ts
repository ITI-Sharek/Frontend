/**
 * Generates a client-side idempotency key for one logical side-effecting
 * attempt (8-128 printable non-whitespace characters per the API contract).
 * Callers keep the same key across retries of the same attempt so the
 * backend can safely replay the original result, and mint a new key only
 * when starting a genuinely new attempt.
 */
export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}
