import { describe, expect, it } from "vitest";

import {
  formatNotificationDate,
  getNotificationPriorityLabel,
  getNotificationContent,
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

  it("presents persisted skill-generation copy in Arabic", () => {
    expect(
      getNotificationContent({
        notificationId: "notification-1",
        userId: "user-1",
        type: "skill_profile_generation",
        title: "Skill analysis ready for review",
        message: "Your skill analysis is complete.",
        metadata: {
          status: "ready_for_review",
          skillCount: 2,
        },
        isRead: false,
        readAt: null,
        createdAt: "2026-08-08T20:00:00.000Z",
      }),
    ).toEqual({
      title: "تحليل المهارات جاهز للمراجعة",
      message: "اكتمل تحليل مهاراتك. توجد 2 مهارات في انتظار مراجعة الإدارة.",
    });
  });

  it("presents skill-generation notifications for admins distinctly", () => {
    expect(
      getNotificationContent({
        notificationId: "notification-admin-1",
        userId: "admin-1",
        type: "skill_profile_generation",
        title: "Skill analysis awaiting admin review",
        message: "A contributor has a completed skill analysis.",
        metadata: {
          status: "ready_for_review",
          skillCount: 3,
          audience: "admin",
        },
        isRead: false,
        readAt: null,
        createdAt: "2026-08-08T20:00:00.000Z",
      }),
    ).toEqual({
      title: "تحليل مهارات جديد للمراجعة",
      message:
        "يوجد تحليل مهارات مكتمل من أحد المساهمين ويحتوي على 3 مهارات في انتظار مراجعتك.",
    });
  });
});
