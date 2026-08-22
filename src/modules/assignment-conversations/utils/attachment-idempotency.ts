/**
 * A bare UUID v4, with no prefix — the same generator shape as
 * `modules/materials/utils/material-idempotency.ts`. Every Chat Attachment
 * upload command validates its key with `@IsUUID('4')`, so a prefixed key is
 * rejected as malformed before the command is ever read.
 *
 * Duplicated here rather than imported from the Materials module: a module
 * must never import another module's internals directly.
 */
export function createChatAttachmentIdempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}
