import { describe, expect, it } from "vitest";

import {
  formatNotificationDate,
  getNotificationPriorityLabel,
  getNotificationTypeLabel,
} from "./notification-presenter";
import { NOTIFICATION_TYPES } from "../types/notification.types";

describe("notification presenter", () => {
  it("labels every semantic notification category", () => {
    for (const category of NOTIFICATION_TYPES) {
      expect(getNotificationTypeLabel(category)).not.toBe("");
    }
    expect(getNotificationTypeLabel("skill_profile_generation")).toBe(
      "تحليل المهارات",
    );
    expect(getNotificationTypeLabel("unknown")).toBe("إشعار");
  });

  it("presents priority as text and preserves long localized dates", () => {
    expect(getNotificationPriorityLabel("urgent")).toBe("عاجل");
    expect(getNotificationPriorityLabel("attention")).toBe("يحتاج انتباهًا");
    expect(getNotificationPriorityLabel("ambient")).toBe("للعلم");
    expect(getNotificationPriorityLabel("unknown")).toBe("إشعار");
    expect(formatNotificationDate("not-a-date")).toBe("not-a-date");
  });
});
