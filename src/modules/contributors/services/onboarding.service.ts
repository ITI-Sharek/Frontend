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
        { id: "fetch", label: "جلب المستودعات العامة", status: "done" },
        { id: "languages", label: "تحليل اللغات والتقنيات", status: "done" },
        { id: "skills", label: "استخراج المهارات مع الأدلة", status: "running" },
        { id: "prepare", label: "تجهيز الملف للمراجعة", status: "todo" },
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
