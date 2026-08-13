import i18n from "@/lib/i18n";

import type {
  OnboardingStateDto,
  OnboardingStep,
} from "../types/onboarding.types";

/**
 * MOCK SERVICE — no onboarding endpoint exists yet. The `step` override is a
 * dev/demo affordance; the real flow derives the step from backend state
 * (GITHUB_ACCOUNT.ingestion_status + profile review status).
 */
export async function getOnboardingState(
  step: OnboardingStep = "connect",
): Promise<OnboardingStateDto> {
  return Promise.resolve({
    step,
    github: {
      connected: step !== "connect",
      username: step === "connect" ? null : "sara-dev",
    },
    analysis: {
      status: step === "analysis" ? "in_progress" : "completed",
      stages: [
        {
          id: "fetch",
          label: i18n.t("contributor.onboardingStages.fetch"),
          status: "done",
        },
        {
          id: "languages",
          label: i18n.t("contributor.onboardingStages.languages"),
          status: "done",
        },
        {
          id: "skills",
          label: i18n.t("contributor.onboardingStages.skills"),
          status: "running",
        },
        {
          id: "prepare",
          label: i18n.t("contributor.onboardingStages.prepare"),
          status: "todo",
        },
      ],
    },
    generatedSkills: [
      { name: "React", proficiency: "advanced", confidence: 0.92 },
      { name: "TypeScript", proficiency: "intermediate", confidence: 0.85 },
      { name: "Node.js", proficiency: "intermediate", confidence: 0.78 },
      { name: "PostgreSQL", proficiency: "beginner", confidence: 0.55 },
      { name: "Docker", proficiency: "beginner", confidence: 0.41 },
    ],
    reviewOutcome: null,
  });
}
