import { describe, expect, it } from "vitest";
import i18n from "@/lib/i18n";

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
      expect(getNotificationTypeLabel(i18n.t, category)).not.toBe("");
    }
    expect(getNotificationTypeLabel(i18n.t, "skill_profile_generation")).toBe(
      "تحليل المهارات",
    );
    expect(getNotificationTypeLabel(i18n.t, "unknown")).toBe("إشعار");
  });

  it("presents priority as text and preserves long localized dates", () => {
    expect(getNotificationPriorityLabel(i18n.t, "urgent")).toBe("عاجل");
    expect(getNotificationPriorityLabel(i18n.t, "attention")).toBe("يحتاج انتباهًا");
    expect(getNotificationPriorityLabel(i18n.t, "ambient")).toBe("للعلم");
    expect(getNotificationPriorityLabel(i18n.t, "unknown")).toBe("إشعار");
    expect(formatNotificationDate("not-a-date", "ar-EG")).toBe("not-a-date");
  });

  it("presents persisted skill-generation copy in Arabic", () => {
    expect(
      getNotificationContent(i18n.t, {
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
      message: "اكتمل تحليل مهاراتك. توجد مهارتان في انتظار مراجعة الإدارة.",
    });
  });

  it("presents skill-generation notifications for admins distinctly", () => {
    expect(
      getNotificationContent(i18n.t, {
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
