import { describe, expect, it } from "vitest";

import {
  getApplicationErrorMessage,
  shouldRefreshApplicationAfterError,
} from "./application-copy";

describe("Application stable error presentation", () => {
  it("refreshes after terminal and concurrency races", () => {
    for (const code of [
      "APPLICATION_TERMINAL",
      "APPLICATION_CONCURRENT_MODIFICATION",
      "REQUEST_CANCELLED",
      "REQUEST_TERMINAL",
    ]) {
      expect(shouldRefreshApplicationAfterError(apiError(code))).toBe(true);
    }
    expect(
      shouldRefreshApplicationAfterError(
        apiError("APPLICATION_IDEMPOTENCY_CONFLICT"),
      ),
    ).toBe(false);
  });

  it("distinguishes duplicate moderation reports without appeal language", () => {
    const message = getApplicationErrorMessage(
      apiError("OWNER_DECISION_REPORT_ALREADY_EXISTS"),
    );
    expect(message).toContain("أُرسل بلاغ");
    expect(message).not.toContain("استئناف");
  });
});

function apiError(code: string) {
  return {
    isAxiosError: true,
    response: { status: 409, data: { code, message: "Contract error" } },
  };
}
