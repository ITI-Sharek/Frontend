import { Clock, Compass } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";

/**
 * CJ-1 step 4: the human-review gate. Expectation copy per DEC-011; explore
 * stays open while applying remains gated.
 */
export function PendingReviewStep({ exploreHref }: { exploreHref: string }) {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">
          {t("contributor.onboarding.reviewTitle")}
        </h2>
        <StatusChip tone="waiting" icon={Clock}>
          {t("contributor.onboarding.reviewBadge")}
        </StatusChip>
      </div>

      <p className="mt-3 leading-7 text-muted-foreground">
        {t("contributor.onboarding.reviewInProgress")}{" "}
        <b className="text-foreground">
          {t("contributor.onboarding.reviewWithin48Hours")}
        </b>
        {t("contributor.onboarding.reviewWillNotify")}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <a
          href={exploreHref}
          className="inline-flex items-center gap-2 rounded-input border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border/20"
        >
          <Compass className="size-4" />
          {t("contributor.onboarding.reviewExplore")}
        </a>
        <span className="text-xs text-muted-foreground">
          {t("contributor.onboarding.reviewApplyingGate")}
        </span>
      </div>
    </Card>
  );
}
