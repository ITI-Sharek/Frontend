import { ClipboardList, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SectionHeading } from "@/shared/components/layout/page-layout";
import { StatBlock, StatValue } from "@/shared/components/data-display/stat";

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
  const { t, i18n } = useTranslation();

  const previous = growth.ratingPrevious;
  const current = growth.ratingCurrent;
  const delta = previous !== null && current !== null ? current - previous : null;

  return (
    <section
      id="record"
      className="scroll-mt-28"
      aria-labelledby="record-heading"
    >
      <SectionHeading
        eyebrow={t("dashboard.growth.verifiedProgress")}
        title={
          <span id="record-heading">{t("dashboard.growth.recordTitle")}</span>
        }
      />

      <div className="grid overflow-hidden rounded-card border border-border bg-card shadow-[var(--shadow-record)] md:grid-cols-[1.5fr_0.5fr]">
        <div className="p-5 sm:p-6">
          {showGrowthPath ? (
            <p className="text-sm leading-7 text-muted-foreground">
              {t("dashboard.growth.growthPath")}
            </p>
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/*
               * A rating change is two facts — where it stands now, and which
               * way it moved. The current value is the headline; the previous
               * one is set small beside it with the delta, so the reader is
               * never asked to work out the direction from "4.6 ← 4.8".
               */}
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("dashboard.growth.rating")}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2.5" dir="ltr">
                  <StatValue value={current?.toFixed(1) ?? "—"} size="xl" />
                  {delta !== null && Math.abs(delta) >= 0.05 ? (
                    <span
                      className={
                        delta > 0
                          ? "inline-flex items-center gap-1 rounded-full bg-evidence-soft px-2 py-0.5 text-xs font-bold text-evidence-soft-foreground"
                          : "inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-bold text-destructive"
                      }
                    >
                      <TrendingUp
                        className={delta > 0 ? "size-3.5" : "size-3.5 rotate-180"}
                        aria-hidden
                      />
                      <span className="tnum">
                        {delta > 0 ? "+" : "−"}
                        {Math.abs(delta).toFixed(1)}
                      </span>
                    </span>
                  ) : null}
                </div>
                {previous !== null ? (
                  <p className="tnum mt-1 text-xs text-subtle-foreground">
                    {t("dashboard.growth.ratingPrevious", {
                      value: previous.toFixed(1),
                    })}
                  </p>
                ) : null}
              </div>

              <dl className="flex gap-8">
                <StatBlock
                  label={t("contributor.reputation.completedContributions")}
                  value={growth.completedCount}
                  size="lg"
                />
                <StatBlock
                  label={t("contributor.reputation.successRate")}
                  value={new Intl.NumberFormat(i18n.language, {
                    style: "percent",
                    maximumFractionDigits: 0,
                  }).format((growth.successRate ?? 0) / 100)}
                  size="lg"
                  tone="evidence"
                />
              </dl>
            </div>
          )}

          {!showGrowthPath && (
            <p className="mt-6 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-evidence-teal">
              <Sparkles className="size-4 shrink-0" aria-hidden />
              {/* The locale string already carries its own leading "+". */}
              {t("dashboard.growth.skillsThisMonth", {
                count: growth.skillsVerifiedThisMonth,
              })}
            </p>
          )}
        </div>

        <div className="border-t border-border bg-surface-fog p-5 sm:p-6 md:border-s md:border-t-0">
          <span className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary">
            <ClipboardList className="size-4.5" aria-hidden />
          </span>
          <dl className="mt-4">
            <dt className="text-sm font-medium text-muted-foreground">
              {t("dashboard.applications.pendingOwnerReview")}
            </dt>
            <dd className="mt-1.5">
              <StatValue value={applications.pendingOwnerReviewCount} size="xl" />
            </dd>
          </dl>
          <p className="mt-3 text-xs leading-5 text-subtle-foreground">
            {t("dashboard.applications.decisionNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
