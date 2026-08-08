import { describe, expect, it } from "vitest";

import {
  getNotificationContent,
  getNotificationTypeLabel,
} from "./notification-presenter";

describe("notification presenter", () => {
  it("labels skill review notifications", () => {
    expect(getNotificationTypeLabel("skill_review")).toBe("مراجعة المهارات");
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
