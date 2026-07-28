import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

import type { ProjectManualOverrideField } from "../types/project-draft.types";

/**
 * Keeps one key per logical restore request. A retry for the same revision and
 * field reuses its key, while another field (or a newer revision) cannot reuse
 * that request scope accidentally.
 */
export function getRestoreFieldIdempotencyKey(
  keys: Map<string, string>,
  revision: number,
  field: ProjectManualOverrideField,
  createKey: () => string = createIdempotencyKey,
): string {
  const scope = `${revision}:${field}`;
  const existing = keys.get(scope);
  if (existing) return existing;

  const key = createKey();
  keys.set(scope, key);
  return key;
}
