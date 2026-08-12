import { ChevronLeft, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import type {
  ApplicationsSummaryDto,
  GrowthSummaryDto,
} from "../types/dashboard.types";

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
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-card border border-border bg-card p-5">
        <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
          {t("dashboard.growth.title")}
        </h2>
        {showGrowthPath ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {t("dashboard.growth.growthPath")}
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            <p className="flex items-center gap-2 text-xl font-bold text-foreground">
              <span dir="ltr" className="inline-flex items-center gap-1.5">
                {growth.ratingPrevious?.toFixed(1)} ← {growth.ratingCurrent?.toFixed(1)}
              </span>
              <TrendingUp className="size-4 text-primary" />
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.growth.completedContributions", {
                count: growth.completedCount,
                rate: growth.successRate,
              })}
            </p>
            <p className="text-sm text-evidence-teal">
              {t("dashboard.growth.skillsThisMonth", {
                count: growth.skillsVerifiedThisMonth,
              })}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-card border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            {t("dashboard.applications.title")}
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:opacity-80"
          >
            {t("dashboard.applications.viewAll")}
            <ChevronLeft className="size-4" />
          </a>
        </div>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">
              {t("dashboard.applications.pendingOwnerReview")}
            </dt>
            <dd className="font-bold text-foreground">
              {applications.pendingOwnerReviewCount}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
