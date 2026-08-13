import { useTranslation } from "react-i18next";

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
const STEP_LABEL_KEYS = [
  "contributor.onboarding.stepConnect",
  "contributor.onboarding.stepAnalysis",
  "contributor.onboarding.stepPreview",
  "contributor.onboarding.stepReview",
  "contributor.onboarding.stepDecision",
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
  const { t } = useTranslation();
  const currentIndex = STEP_ORDER.indexOf(state.step);
  const stepLabels = STEP_LABEL_KEYS.map((key) => t(key));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("contributor.onboarding.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("contributor.onboarding.subheading")}
        </p>
      </div>

      <StepIndicator steps={stepLabels} currentStep={currentIndex} />

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
