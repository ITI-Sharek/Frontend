import type {
  ContributorDashboardDto,
  DashboardLifecycleState,
} from "../types/dashboard.types";
import type { TFunction } from "i18next";

/**
 * MOCK SERVICE — no dashboard endpoint exists in the backend yet.
 * Data mirrors the documented wireframe (WF-02) exactly so the UI can be
 * validated against it. When `GET /contributors/dashboard` lands, replace
 * the mock below with an axios call returning `ContributorDashboardDto`;
 * the `state` override parameter is a dev/demo affordance only.
 */

function getBaseMock(t: TFunction): Omit<ContributorDashboardDto, "state"> {
  return {
  greetingName: "Sara",
  unreadNotifications: 2,
  quota: { planName: "Free", usedToday: 1, dailyLimit: 1 },
  attentionItems: [
    {
      id: "attention-1",
      kind: "changes_requested",
      title: t("dashboard.mock.attention.changesTitle"),
      subtitle: t("dashboard.mock.attention.changesSubtitle"),
      actionLabel: t("dashboard.mock.attention.changesAction"),
    },
    {
      id: "attention-2",
      kind: "accepted",
      title: t("dashboard.mock.attention.acceptedTitle"),
      subtitle: t("dashboard.mock.attention.acceptedSubtitle"),
      actionLabel: t("dashboard.mock.attention.acceptedAction"),
    },
  ],
  matchReason: t("dashboard.mock.matchReason"),
  matchedTasks: [
    {
      id: "task-1",
      title: t("dashboard.mock.tasks.notifications"),
      projectName: "sharek-backend",
      requiredSkills: ["React", "Node.js", "WebSocket"],
      matchedCount: 3,
      requiredCount: 3,
    },
    {
      id: "task-2",
      title: t("dashboard.mock.tasks.performance"),
      projectName: "masar-transit",
      requiredSkills: ["React", "TypeScript", "SQLite"],
      matchedCount: 2,
      requiredCount: 3,
    },
    {
      id: "task-3",
      title: t("dashboard.mock.tasks.integration"),
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
  applications: { pendingOwnerReviewCount: 2 },
  onboardingSteps: [
    { id: "account", label: t("dashboard.mock.onboarding.account"), status: "done", hint: null },
    { id: "github", label: t("dashboard.mock.onboarding.github"), status: "done", hint: null },
    {
      id: "analysis",
      label: t("dashboard.mock.onboarding.analysis"),
      status: "in_progress",
      hint: t("dashboard.mock.onboarding.analysisHint"),
    },
    {
      id: "review",
      label: t("dashboard.mock.onboarding.review"),
      status: "todo",
      hint: t("dashboard.mock.onboarding.reviewHint"),
    },
  ],
  fullyMatchedTasksCount: 5,
  };
}

export async function getContributorDashboard(
  state: DashboardLifecycleState = "active",
  t: TFunction,
): Promise<ContributorDashboardDto> {
  return Promise.resolve({ ...getBaseMock(t), state });
}
