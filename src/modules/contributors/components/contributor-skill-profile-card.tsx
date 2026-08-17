import {
  ArrowRight,
  Bot,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ContributorProfileDto } from "../types/contributor-profile.types";

interface SkillItem {
  name: string;
  level: "Advanced" | "Intermediate" | "Beginner";
  score: number;
  iconBg: string;
  iconColor: string;
  iconText?: string;
  iconType: "text" | "react" | "node" | "python" | "next" | "git" | "docker";
}

function normalizeConfidence(value: number): number {
  return Math.round(value <= 1 ? value * 100 : value);
}

function toSkillItem(
  skill: ContributorProfileDto["skills"][number],
): SkillItem {
  const normalizedName = skill.name.toLowerCase();
  const iconType = normalizedName.includes("react")
    ? "react"
    : normalizedName.includes("node")
      ? "node"
      : normalizedName.includes("python")
        ? "python"
        : normalizedName.includes("next")
          ? "next"
          : normalizedName === "git"
            ? "git"
            : normalizedName.includes("docker")
              ? "docker"
              : "text";

  return {
    name: skill.name,
    level: `${skill.proficiencyLevel.charAt(0).toUpperCase()}${skill.proficiencyLevel.slice(1)}` as SkillItem["level"],
    score: normalizeConfidence(skill.confidence),
    iconBg: "bg-blue-50 dark:bg-blue-950/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconText: skill.name.slice(0, 2).toUpperCase(),
    iconType,
  };
}

export function ContributorSkillProfileCard({
  profile,
  onViewFullProfile,
}: {
  profile: ContributorProfileDto;
  onViewFullProfile?: () => void;
}) {
  const { t } = useTranslation();
  const skillsToRender = profile.skills
    .filter((skill) => skill.status !== "superseded")
    .slice(0, 8)
    .map(toSkillItem);
  const averageConfidence = skillsToRender.length
    ? Math.round(
        skillsToRender.reduce((total, skill) => total + skill.score, 0) /
          skillsToRender.length,
      )
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
            <Bot className="size-4.5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("contributor.dynamic.skillProfile")}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#15803D] dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Sparkles className="size-3 fill-current" />
            {t("contributor.dynamic.aiGenerated")}
          </span>
        </div>

        {/* Confidence & Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t("contributor.dynamic.confidence", { value: averageConfidence })}
          </span>
          <div
            className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={averageConfidence}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("contributor.dynamic.confidence", { value: averageConfidence })}
          >
            <div
              className="h-full rounded-full bg-[#10B981] transition-all"
              style={{ width: `${averageConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of 8 Skills: 4 columns on desktop */}
      {skillsToRender.length > 0 ? <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {skillsToRender.map((skill) => (
          <div
            key={skill.name}
            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-2.5">
              {/* Skill Icon Badge */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${skill.iconBg} ${skill.iconColor}`}
              >
                {skill.iconType === "text" && (
                  <span className="font-mono text-xs font-bold">{skill.iconText}</span>
                )}
                {skill.iconType === "react" && <ReactIcon className="size-4.5" />}
                {skill.iconType === "node" && <NodeIcon className="size-4.5" />}
                {skill.iconType === "python" && <PythonIcon className="size-4.5" />}
                {skill.iconType === "next" && (
                  <span className="font-mono text-xs font-black leading-none">N</span>
                )}
                {skill.iconType === "git" && <GitIcon className="size-4" />}
                {skill.iconType === "docker" && <DockerIcon className="size-4.5" />}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {skill.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {skill.level}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
              {skill.score}%
            </span>
          </div>
        ))}
      </div> : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {t("contributor.dynamic.noSkills")}
        </p>
      )}

      {/* Footer link button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onViewFullProfile}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-3.5 py-2 text-xs font-semibold text-[#2563EB] transition-colors hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/60 cursor-pointer"
        >
          <span>{t("contributor.dynamic.viewFullSkillProfile")}</span>
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}

function ReactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
    </svg>
  );
}

function NodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
      <path d="M12 2v18" strokeDasharray="2 2" />
    </svg>
  );
}

function PythonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.85 2c-5.4 0-5.06 2.34-5.06 2.34l.01 2.42h5.15v.73H4.82S2 7.16 2 12.63c0 5.46 2.46 5.27 2.46 5.27h1.47v-2.07s-.08-2.46 2.43-2.46h5.16s2.35.04 2.35-2.28V4.35S16.27 2 11.85 2zm-2.8 1.45a.9.9 0 110 1.8.9.9 0 010-1.8z" opacity="0.9" />
      <path d="M12.15 22c5.4 0 5.06-2.34 5.06-2.34l-.01-2.42h-5.15v-.73h7.13s2.82.33 2.82-5.14c0-5.46-2.46-5.27-2.46-5.27h-1.47v2.07s.08 2.46-2.43 2.46H10.5s-2.35-.04-2.35 2.28v6.73S7.73 22 12.15 22zm2.8-1.45a.9.9 0 110-1.8.9.9 0 010 1.8z" />
    </svg>
  );
}

function GitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function DockerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="2" y="10" width="3" height="3" rx="0.5" />
      <rect x="6" y="10" width="3" height="3" rx="0.5" />
      <rect x="10" y="10" width="3" height="3" rx="0.5" />
      <rect x="6" y="6" width="3" height="3" rx="0.5" />
      <rect x="10" y="6" width="3" height="3" rx="0.5" />
      <rect x="14" y="6" width="3" height="3" rx="0.5" />
      <path d="M22 12c-.5-1.5-2-2-2-2-.5 1-1.5 1-1.5 1s-1-.5-2-.5c-3 0-5 2-6 4H1c0 4 3 6 8 6 6 0 10-3 12-7 .5 0 1-.5 1-.5z" />
    </svg>
  );
}
