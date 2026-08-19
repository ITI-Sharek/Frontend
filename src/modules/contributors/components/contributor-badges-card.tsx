import { ArrowRight, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ContributorBadgeDto } from "../types/contributor-profile.types";

const BADGE_PRESENTATION: Record<
  ContributorBadgeDto["badgeType"],
  { shieldType: "gold" | "red" | "blue" | "green"; titleKey: string; descriptionKey: string }
> = {
  first_contribution: {
    shieldType: "gold",
    titleKey: "contributor.dynamic.badgeFirstContribution",
    descriptionKey: "contributor.dynamic.badgeFirstContributionDescription",
  },
};

export function ContributorBadgesCard({
  badges = [],
  onViewAll,
}: {
  badges?: ContributorBadgeDto[];
  onViewAll?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="size-4.5 text-slate-800 dark:text-slate-200" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("contributor.dynamic.achievements")}
          </h2>
        </div>

        {onViewAll && badges.length > 0 && <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          <span>{t("common.viewAll") || "View All"}</span>
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </button>}
      </div>

      {/* Badges list */}
      {badges.length > 0 ? <div className="mt-4 flex flex-col gap-3.5">
        {badges.map((badge) => {
          const presentation = BADGE_PRESENTATION[badge.badgeType];
          return (
            <div key={badge.id} className="flex items-center gap-3.5">
              {/* Hexagonal / Shield icon */}
              <div className="relative flex size-9 shrink-0 items-center justify-center">
                <ShieldBadge type={presentation.shieldType} />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(presentation.titleKey)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t(presentation.descriptionKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div> : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("contributor.dynamic.noAchievements")}
        </p>
      )}
    </div>
  );
}

function ShieldBadge({ type }: { type: "gold" | "red" | "blue" | "green" }) {
  if (type === "gold") {
    return (
      <svg viewBox="0 0 36 36" className="size-9">
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <path
          d="M18 3 L31 8 V19 C31 26.5 24.5 32 18 34 C11.5 32 5 26.5 5 19 V8 Z"
          fill="url(#gold-grad)"
        />
        <path
          d="M18 11 L20 15 L24.5 15.5 L21 18.5 L22 23 L18 20.5 L14 23 L15 18.5 L11.5 15.5 L16 15 Z"
          fill="#FFF"
          opacity="0.95"
        />
      </svg>
    );
  }

  if (type === "red") {
    return (
      <svg viewBox="0 0 36 36" className="size-9">
        <defs>
          <linearGradient id="red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
        </defs>
        <path
          d="M18 3 L31 8 V19 C31 26.5 24.5 32 18 34 C11.5 32 5 26.5 5 19 V8 Z"
          fill="url(#red-grad)"
        />
        <path
          d="M18 10 C18 10 22 14 22 18 C22 20.5 20.2 22.5 18 22.5 C15.8 22.5 14 20.5 14 18 C14 15 16.5 12.5 18 10 Z"
          fill="#FFF"
          opacity="0.95"
        />
      </svg>
    );
  }

  if (type === "blue") {
    return (
      <svg viewBox="0 0 36 36" className="size-9">
        <defs>
          <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <path
          d="M18 3 L31 8 V19 C31 26.5 24.5 32 18 34 C11.5 32 5 26.5 5 19 V8 Z"
          fill="url(#blue-grad)"
        />
        <circle cx="18" cy="15" r="3" fill="#FFF" opacity="0.95" />
        <path
          d="M13 22 C13 19.5 15.2 18.5 18 18.5 C20.8 18.5 23 19.5 23 22 Z"
          fill="#FFF"
          opacity="0.95"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 36 36" className="size-9">
      <defs>
        <linearGradient id="green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M18 3 L31 8 V19 C31 26.5 24.5 32 18 34 C11.5 32 5 26.5 5 19 V8 Z"
        fill="url(#green-grad)"
      />
      <path
        d="M14 18 L17 21 L23 14"
        fill="none"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
