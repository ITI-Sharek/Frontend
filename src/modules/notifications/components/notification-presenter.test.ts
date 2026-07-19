import { describe, expect, it } from "vitest";

import { getNotificationTypeLabel } from "./notification-presenter";

describe("notification presenter", () => {
  it("labels skill review notifications", () => {
    expect(getNotificationTypeLabel("skill_review")).toBe("مراجعة المهارات");
  });
});
