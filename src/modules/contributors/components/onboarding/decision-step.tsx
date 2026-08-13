import { BadgeCheck, CircleAlert, MessageSquareWarning } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import type { OnboardingOutcome } from "../../types/onboarding.types";

/**
 * CJ-1 step 5: review decision. Approved celebrates briefly then points to
 * work; partial explains the §5 rule; rejected follows Principle 5 —
 * honest reason + forward actions, never a wall.
 */
export function DecisionStep({
  outcome,
  dashboardHref,
  onReanalyze,
}: {
  outcome: OnboardingOutcome;
  dashboardHref: string;
  onReanalyze: () => void;
}) {
  const { t } = useTranslation();

  if (outcome === "approved") {
    return (
      <Card className="border-evidence-teal/40 bg-evidence-teal/5">
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-evidence-teal">
          <BadgeCheck className="size-4" />
          {t("contributor.onboarding.decisionApprovedBadge")}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          {t("contributor.onboarding.decisionApprovedTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("contributor.onboarding.decisionApprovedDescription")}
        </p>
        <Button asChild size="sm" className="mt-4">
          <a href={dashboardHref}>{t("contributor.onboarding.decisionGoToDashboard")}</a>
        </Button>
      </Card>
    );
  }

  if (outcome === "partially_approved") {
    return (
      <Card>
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-amber-600 dark:text-amber-400">
          <CircleAlert className="size-4" />
          {t("contributor.onboarding.decisionPartialBadge")}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          {t("contributor.onboarding.decisionPartialTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t("contributor.onboarding.decisionPartialDescriptionBefore")}{" "}
          <b className="text-foreground">{t("contributor.onboarding.decisionPartialDescriptionBold")}</b>
          {t("contributor.onboarding.decisionPartialDescriptionAfter")}
        </p>
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm">
            <a href={dashboardHref}>{t("contributor.onboarding.decisionGoToDashboard")}</a>
          </Button>
          <Button size="sm" variant="outline" onClick={onReanalyze}>
            {t("contributor.onboarding.decisionReanalyzeLater")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-destructive">
        <MessageSquareWarning className="size-4" />
        {t("contributor.onboarding.decisionRejectedBadge")}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-foreground">
        {t("contributor.onboarding.decisionRejectedTitle")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("contributor.onboarding.decisionRejectedDescription")}
      </p>
      <ol className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        <li>{t("contributor.onboarding.decisionRejectedStep1")}</li>
        <li>{t("contributor.onboarding.decisionRejectedStep2")}</li>
        <li>{t("contributor.onboarding.decisionRejectedStep3")}</li>
      </ol>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline">
          {t("contributor.onboarding.decisionAppeal")}
        </Button>
        <Button size="sm" variant="outline" onClick={onReanalyze}>
          {t("contributor.onboarding.decisionReanalyzeAfterImprovement")}
        </Button>
      </div>
    </Card>
  );
}
