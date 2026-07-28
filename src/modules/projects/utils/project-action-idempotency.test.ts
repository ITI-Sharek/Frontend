import { describe, expect, it, vi } from "vitest";

import { getRestoreFieldIdempotencyKey } from "./project-action-idempotency";

describe("restore-field idempotency", () => {
  it("reuses a key only for the same revision and field", () => {
    const keys = new Map<string, string>();
    const createKey = vi
      .fn<() => string>()
      .mockReturnValueOnce("key-title-r1")
      .mockReturnValueOnce("key-tags-r1")
      .mockReturnValueOnce("key-title-r2");

    expect(getRestoreFieldIdempotencyKey(keys, 1, "title", createKey)).toBe(
      "key-title-r1",
    );
    expect(getRestoreFieldIdempotencyKey(keys, 1, "title", createKey)).toBe(
      "key-title-r1",
    );
    expect(getRestoreFieldIdempotencyKey(keys, 1, "tags", createKey)).toBe(
      "key-tags-r1",
    );
    expect(getRestoreFieldIdempotencyKey(keys, 2, "title", createKey)).toBe(
      "key-title-r2",
    );
    expect(createKey).toHaveBeenCalledTimes(3);
  });
});
