/**
 * Contributor onboarding contract (CJ-1 · screen-inventory §2.1 · WF-08).
 * Mock-first: `onboarding.service.ts` serves this shape; future endpoints
 * are `GET /contributors/onboarding` + the DEC-015 ingestion polling
 * contract (`GET /ingestions/:id`, 4-state fallback used here).
 */

export type OnboardingStep =
  | "connect"
  | "analysis"
  | "preview"
  | "review"
  | "decision";

export type OnboardingOutcome = "approved" | "partially_approved" | "rejected";

export interface AnalysisStageDto {
  id: string;
  label: string;
  status: "done" | "running" | "todo";
}

export interface GeneratedSkillDto {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced";
  confidence: number;
}

export interface OnboardingStateDto {
  step: OnboardingStep;
  github: { connected: boolean; username: string | null };
  analysis: {
    status: "queued" | "in_progress" | "completed" | "failed";
    stages: AnalysisStageDto[];
  };
  generatedSkills: GeneratedSkillDto[];
  reviewOutcome: OnboardingOutcome | null;
}
