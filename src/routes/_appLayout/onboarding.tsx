import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { getOnboardingState, OnboardingView } from "@/modules/contributors";
import { startGitHubConnect } from "@/modules/github";
import type {
  OnboardingOutcome,
  OnboardingStep,
} from "@/modules/contributors";

const STEPS: OnboardingStep[] = [
  "connect",
  "analysis",
  "preview",
  "review",
  "decision",
];
const OUTCOMES = ["approved", "partial", "rejected"] as const;

interface OnboardingSearch {
  /** Dev/demo switches while the flow is mocked. */
  step?: OnboardingStep;
  outcome?: (typeof OUTCOMES)[number];
}

const OUTCOME_MAP: Record<
  (typeof OUTCOMES)[number],
  OnboardingOutcome
> = {
  approved: "approved",
  partial: "partially_approved",
  rejected: "rejected",
};

export const Route = createFileRoute("/_appLayout/onboarding")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "تفعيل الحساب | Sharek" }] }),
  validateSearch: (search: Record<string, unknown>): OnboardingSearch => ({
    ...(STEPS.includes(search.step as OnboardingStep)
      ? { step: search.step as OnboardingStep }
      : {}),
    ...(OUTCOMES.includes(search.outcome as (typeof OUTCOMES)[number])
      ? { outcome: search.outcome as (typeof OUTCOMES)[number] }
      : {}),
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { step = "connect", outcome = "approved" } = Route.useSearch();
  const navigate = Route.useNavigate();

  const onboardingQuery = useQuery({
    queryKey: ["contributors", "onboarding", step],
    queryFn: () => getOnboardingState(step),
  });

  if (onboardingQuery.data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <OnboardingView
      state={onboardingQuery.data}
      outcome={OUTCOME_MAP[outcome]}
      onGoToStep={(nextStep) =>
        void navigate({ search: { step: nextStep, outcome }, replace: true })
      }
      onConnectGitHub={() => startGitHubConnect(ROUTES.onboarding)}
      exploreHref={ROUTES.explore}
      dashboardHref={ROUTES.dashboard}
    />
  );
}
