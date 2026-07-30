import { describe, expect, it } from "vitest";

import {
  getApplicationErrorMessage,
  getApplicationSubmissionErrorMessage,
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

describe("Application stable error copy", () => {
  it.each([
    ["ALREADY_APPLIED", "طلب تقديم سابق"],
    ["APPLICATIONS_CLOSED", "أُغلق التقديم"],
    ["REQUEST_CANCELLED", "ألغى صاحب المشروع"],
    ["REQUEST_TERMINAL", "حالة نهائية"],
    ["APPLICATION_NOT_AUTHORIZED", "غير مخوّل"],
    ["APPLICATION_IDEMPOTENCY_CONFLICT", "تعارضت محاولة"],
  ])("maps %s without matching backend message text", (code, expected) => {
    const message = getApplicationSubmissionErrorMessage({
      isAxiosError: true,
      response: {
        status: 409,
        data: { code, message: "This text may change" },
      },
    });

    expect(message).toContain(expected);
    expect(message).not.toContain("This text may change");
  });
});
