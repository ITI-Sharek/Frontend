import type {
  ContributorDashboardDto,
  DashboardLifecycleState,
} from "../types/dashboard.types";

/**
 * MOCK SERVICE — no dashboard endpoint exists in the backend yet.
 * Data mirrors the documented wireframe (WF-02) exactly so the UI can be
 * validated against it. When `GET /contributors/dashboard` lands, replace
 * the mock below with an axios call returning `ContributorDashboardDto`;
 * the `state` override parameter is a dev/demo affordance only.
 */

const BASE_MOCK: Omit<ContributorDashboardDto, "state"> = {
  greetingName: "سارة",
  unreadNotifications: 2,
  quota: { planName: "Bronze", usedToday: 1, dailyLimit: 2 },
  attentionItems: [
    {
      id: "attention-1",
      kind: "changes_requested",
      title: "مطلوب تعديلات على تسليم «إضافة مصادقة JWT»",
      subtitle: "ملاحظات صاحب المشروع مرفقة",
      actionLabel: "افتح وعدّل",
    },
    {
      id: "attention-2",
      kind: "accepted",
      title: "تم قبولك في «إصلاح تخطيط RTL»",
      subtitle: "الموعد النهائي خلال 6 أيام",
      actionLabel: "تسليم طلب السحب (PR)",
    },
  ],
  matchReason: "مهاراتك الموثقة في React وNode.js",
  matchedTasks: [
    {
      id: "task-1",
      title: "بناء لوحة إشعارات فورية",
      projectName: "sharek-backend",
      requiredSkills: ["React", "Node.js", "WebSocket"],
      matchedCount: 3,
      requiredCount: 3,
    },
    {
      id: "task-2",
      title: "تحسين أداء قوائم المهام",
      projectName: "masar-transit",
      requiredSkills: ["React", "TypeScript", "SQLite"],
      matchedCount: 2,
      requiredCount: 3,
    },
    {
      id: "task-3",
      title: "إضافة اختبارات تكامل للواجهة",
      projectName: "hisab-ledger",
      requiredSkills: ["React", "Node.js", "Vitest"],
      matchedCount: 3,
      requiredCount: 3,
    },
  ],
  growth: {
    ratingPrevious: 4.6,
    ratingCurrent: 4.8,
    completedCount: 6,
    successRate: 92,
    skillsVerifiedThisMonth: 2,
  },
  applications: { eligibleCount: 1, waitingOwnerCount: 1 },
  onboardingSteps: [
    { id: "account", label: "إنشاء الحساب", status: "done", hint: null },
    { id: "github", label: "ربط GitHub", status: "done", hint: null },
    {
      id: "analysis",
      label: "التحليل قيد التنفيذ…",
      status: "in_progress",
      hint: "(~دقيقتان) — سنخبرك عند الانتهاء",
    },
    {
      id: "review",
      label: "مراجعة فريق المراجعة",
      status: "todo",
      hint: "بعد اكتمال التحليل",
    },
  ],
  fullyMatchedTasksCount: 5,
};

export async function getContributorDashboard(
  state: DashboardLifecycleState = "active",
): Promise<ContributorDashboardDto> {
  return Promise.resolve({ ...BASE_MOCK, state });
}
