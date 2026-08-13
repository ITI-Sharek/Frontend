import { ClipboardList, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  ApplicationsSummaryDto,
  GrowthSummaryDto,
} from "../types/dashboard.types";

/**
 * WF-02 bottom row: "YOUR GROWTH" (deltas, Principle 8) beside
 * "MY APPLICATIONS" (counts + view-all). When there is no growth data yet,
 * the panel shows the path, never zeros.
 */
export function DashboardSummary({
  growth,
  applications,
  showGrowthPath = false,
}: {
  growth: GrowthSummaryDto;
  applications: ApplicationsSummaryDto;
  showGrowthPath?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <section
      id="record"
      className="scroll-mt-28"
      aria-labelledby="record-heading"
    >
      <div>
        <p className="text-xs font-semibold text-primary">
          {t("dashboard.growth.verifiedProgress")}
        </p>
        <h2
          id="record-heading"
          className="mt-1 text-xl font-bold text-foreground"
        >
          {t("dashboard.growth.recordTitle")}
        </h2>
      </div>
      <div className="mt-4 grid overflow-hidden rounded-card border border-border bg-card md:grid-cols-[1.45fr_0.55fr] md:divide-x md:divide-x-reverse md:divide-border">
        <div className="p-5 sm:p-6">
          {showGrowthPath ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("dashboard.growth.growthPath")}
            </p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.growth.rating")}
                </p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
                  <span dir="ltr" className="inline-flex items-center gap-1.5">
                    {growth.ratingPrevious?.toFixed(1)} ←{" "}
                    {growth.ratingCurrent?.toFixed(1)}
                  </span>
                  <TrendingUp className="size-4 text-primary" />
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("contributor.reputation.completedContributions")}
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-foreground">
                    {growth.completedCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    {t("contributor.reputation.successRate")}
                  </dt>
                  <dd className="mt-1 text-lg font-bold text-foreground">
                    {growth.successRate}٪
                  </dd>
                </div>
              </dl>
            </div>
          )}
          {!showGrowthPath && (
            <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm text-evidence-teal-foreground dark:text-evidence-teal">
              <Sparkles className="size-4" aria-hidden />+
              {t("dashboard.growth.skillsThisMonth", {
                count: growth.skillsVerifiedThisMonth,
              })}
            </p>
          )}
        </div>

        <div className="border-t border-border bg-surface-fog p-5 md:border-t-0 sm:p-6">
          <ClipboardList className="size-5 text-primary" aria-hidden />
          <dl className="mt-4">
            <div>
              <dt className="text-sm text-muted-foreground">
                {t("dashboard.applications.pendingOwnerReview")}
              </dt>
              <dd className="mt-1 text-3xl font-bold text-foreground">
                {applications.pendingOwnerReviewCount}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {t("dashboard.applications.decisionNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
