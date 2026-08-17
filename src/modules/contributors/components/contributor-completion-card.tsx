import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
}

const COMPLETION_ITEMS = [
  ["add_bio", "contributor.completion.promptAddBio"],
  ["add_experience", "contributor.completion.promptAddExperience"],
  ["add_fields", "contributor.completion.promptAddFields"],
  ["connect_github", "contributor.completion.promptConnectGithub"],
  ["generate_skills", "contributor.completion.promptGenerateSkills"],
] as const;

export function ContributorCompletionCard({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
  if (profile.viewerRelationship !== "owner") return null;

  const incomplete = new Set(profile.completionPrompts);
  const items: ChecklistItem[] = COMPLETION_ITEMS.map(([key, labelKey]) => ({
    key,
    label: t(labelKey),
    completed: !incomplete.has(key),
  }));
  const completionPercentage = Math.round(
    (items.filter((item) => item.completed).length / items.length) * 100,
  );

  // SVG circular gauge calculations
  const size = 64;
  const strokeWidth = 5.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Top Header with radial gauge */}
      <div className="flex items-center gap-4">
        {/* Circular Progress Gauge */}
        <div className="relative flex shrink-0 items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#10B981"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {completionPercentage}%
          </span>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("contributor.completion.progressLabel") || "Profile Completion"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {completionPercentage === 100
              ? t("contributor.dynamic.profileComplete")
              : t("contributor.dynamic.almostThere")}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-5 flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3">
            {item.completed ? (
              <CheckCircle2 className="size-4.5 shrink-0 fill-emerald-500 text-white dark:fill-emerald-500 dark:text-slate-900" />
            ) : (
              <Circle className="size-4.5 shrink-0 text-slate-300 dark:text-slate-600" />
            )}
            <span
              className={`text-xs ${
                item.completed
                  ? "font-medium text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
