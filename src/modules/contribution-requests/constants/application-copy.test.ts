import { describe, expect, it } from "vitest";

import { getApplicationSubmissionErrorMessage } from "./application-copy";

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
