import {
  ArrowRight,
  Layers,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorRecentActivityCard({
  profile,
  onViewAll,
}: {
  profile: ContributorProfileDto;
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="size-5 text-slate-900 dark:text-white" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("contributor.dynamic.recentContributions")}
          </h2>
        </div>

        {onViewAll && profile.contributionHistory.length > 0 && <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          <span>{t("common.viewAll") || "View All"}</span>
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </button>}
      </div>

      {/* Activity list */}
      {profile.contributionHistory.length > 0 ? <div className="mt-5 flex flex-col gap-4">
        {profile.contributionHistory.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-4 rounded-xl p-2 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3.5">
              {/* Colored Icon box */}
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400"
              >
                <Layers className="size-4.5" />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {activity.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {[activity.role, activity.description].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div> : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("contributor.dynamic.noContributions")}
        </p>
      )}
    </div>
  );
}
