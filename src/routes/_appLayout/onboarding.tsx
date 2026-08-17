import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute, useCurrentUserQuery } from "@/modules/auth";
import {
  ContributorProfileErrorView,
  ContributorWalkthrough,
  useContributorProfileQuery,
} from "@/modules/contributors";
import {
  useLatestSkillProfileGenerationQuery,
  useSkillProfileGenerationQuery,
} from "@/modules/skill-profiles";

export const Route = createFileRoute("/_appLayout/onboarding")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Contributor walkthrough | Sharek" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { t } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();
  const username = currentUserQuery.data?.username ?? "";
  const profileQuery = useContributorProfileQuery(username);
  const latestGenerationQuery = useLatestSkillProfileGenerationQuery({
    enabled: Boolean(profileQuery.data),
  });
  const latestGeneration = latestGenerationQuery.data ?? null;
  const generationQuery = useSkillProfileGenerationQuery({
    generationId: latestGeneration?.generationId ?? "",
    enabled: latestGeneration !== null,
  });
  const generation = generationQuery.data ?? latestGeneration;

  if (
    !profileQuery.data &&
    (currentUserQuery.isPending || profileQuery.isPending)
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4">
        <ContributorProfileErrorView onRetry={() => void profileQuery.refetch()} />
      </div>
    );
  }

  return (
    <ContributorWalkthrough
      profile={profileQuery.data}
      generation={generation}
      profileEditHref={ROUTES.profileEdit}
      analysisHref={ROUTES.githubSkillAnalysis}
      exploreHref={ROUTES.explore}
      dashboardHref={ROUTES.dashboard}
    />
  );
}
