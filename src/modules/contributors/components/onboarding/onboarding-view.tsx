import { StepIndicator } from "@/shared/components/navigation/step-indicator";

import { AnalysisProgressStep } from "./analysis-progress-step";
import { DecisionStep } from "./decision-step";
import { GithubConsentStep } from "./github-consent-step";
import { PendingReviewStep } from "./pending-review-step";
import { ProfilePreviewStep } from "./profile-preview-step";
import type {
  OnboardingOutcome,
  OnboardingStateDto,
  OnboardingStep,
} from "../../types/onboarding.types";

const STEP_ORDER: OnboardingStep[] = [
  "connect",
  "analysis",
  "preview",
  "review",
  "decision",
];
const STEP_LABELS = [
  "ربط GitHub",
  "التحليل",
  "المعاينة",
  "المراجعة",
  "القرار",
] as const;

interface OnboardingViewProps {
  state: OnboardingStateDto;
  outcome: OnboardingOutcome;
  /** Route-injected navigation + cross-module actions (composition at route level). */
  onGoToStep: (step: OnboardingStep) => void;
  onConnectGitHub: () => Promise<void>;
  exploreHref: string;
  dashboardHref: string;
}

/**
 * CJ-1 activation stepper — the contributor's critical path from
 * registration to "fully active". Steps are sequential; the stepper is the
 * page's navigation (nav-model: sidebar takes a back seat here).
 */
export function OnboardingView({
  state,
  outcome,
  onGoToStep,
  onConnectGitHub,
  exploreHref,
  dashboardHref,
}: OnboardingViewProps) {
  const currentIndex = STEP_ORDER.indexOf(state.step);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">تفعيل حسابك</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          من ربط GitHub إلى ملف مهاري موثق — خطوة بخطوة.
        </p>
      </div>

      <StepIndicator steps={STEP_LABELS} currentStep={currentIndex} />

      {state.step === "connect" && (
        <GithubConsentStep onConnectGitHub={onConnectGitHub} />
      )}

      {state.step === "analysis" && (
        <AnalysisProgressStep
          stages={state.analysis.stages}
          failed={state.analysis.status === "failed"}
          onCompleted={() => onGoToStep("preview")}
          onRetry={() => onGoToStep("analysis")}
        />
      )}

      {state.step === "preview" && (
        <ProfilePreviewStep
          skills={state.generatedSkills}
          onSubmit={() => onGoToStep("review")}
        />
      )}

      {state.step === "review" && <PendingReviewStep exploreHref={exploreHref} />}

      {state.step === "decision" && (
        <DecisionStep
          outcome={outcome}
          dashboardHref={dashboardHref}
          onReanalyze={() => onGoToStep("analysis")}
        />
      )}
    </div>
  );
}
