import { describe, expect, it, vi } from "vitest";

import { ContributionRequestIdempotencyKeyStore } from "./idempotency-key";

describe("Contribution Request command idempotency", () => {
  it("reuses a key for the identical retry and rotates it after payload changes", () => {
    const generate = vi
      .fn<() => string>()
      .mockReturnValueOnce("create-request-001")
      .mockReturnValueOnce("create-request-002");
    const store = new ContributionRequestIdempotencyKeyStore(generate);

    expect(store.getFor({ title: "Draft", tags: ["NestJS"] })).toBe(
      "create-request-001",
    );
    expect(store.getFor({ tags: ["NestJS"], title: "Draft" })).toBe(
      "create-request-001",
    );
    expect(store.getFor({ title: "Changed", tags: ["NestJS"] })).toBe(
      "create-request-002",
    );
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
