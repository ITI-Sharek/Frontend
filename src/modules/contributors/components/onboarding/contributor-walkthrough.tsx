import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Circle,
  Clock3,
  Github,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import type { SkillProfileGenerationDto } from "@/modules/skill-profiles";

import type { ContributorProfileDto } from "../../types/contributor-profile.types";

type StepState = "complete" | "current" | "upcoming" | "attention";

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  state: StepState;
  icon: typeof UserRound;
}

export function ContributorWalkthrough({
  profile,
  generation,
  profileEditHref,
  analysisHref,
  exploreHref,
  dashboardHref,
}: {
  profile: ContributorProfileDto;
  generation: SkillProfileGenerationDto | null;
  profileEditHref: string;
  analysisHref: string;
  exploreHref: string;
  dashboardHref: string;
}) {
  const { t } = useTranslation();
  const profileReady = Boolean(
    profile.bio?.trim() && profile.experienceLevel && profile.fields.length,
  );
  const githubReady = profile.githubInstallations.some(
    (installation) => installation.status === "active",
  );
  const analysisActive = generation
    ? ["queued", "collecting_evidence", "analyzing"].includes(generation.status)
    : false;
  const analysisNeedsAttention = generation
    ? ["failed", "needs_more_evidence"].includes(generation.status)
    : false;
  const analysisReady = generation?.status === "pending_review";
  const approvedSkills = profile.skills.filter((skill) => skill.status === "approved");
  const reviewDecided = profile.skills.some((skill) =>
    ["approved", "rejected", "disputed"].includes(skill.status),
  );

  const baseSteps = [
    {
      id: "profile",
      title: t("contributor.walkthrough.profileTitle"),
      description: t("contributor.walkthrough.profileDescription"),
      complete: profileReady,
      attention: false,
      icon: UserRound,
    },
    {
      id: "github",
      title: t("contributor.walkthrough.githubTitle"),
      description: t("contributor.walkthrough.githubDescription"),
      complete: githubReady,
      attention: false,
      icon: Github,
    },
    {
      id: "analysis",
      title: t("contributor.walkthrough.analysisTitle"),
      description: t("contributor.walkthrough.analysisDescription"),
      complete: analysisReady || reviewDecided,
      attention: analysisNeedsAttention,
      icon: Sparkles,
    },
    {
      id: "review",
      title: t("contributor.walkthrough.reviewTitle"),
      description: t("contributor.walkthrough.reviewDescription"),
      complete: reviewDecided,
      attention: false,
      icon: ShieldCheck,
    },
  ];
  const currentIndex = Math.max(0, baseSteps.findIndex((step) => !step.complete));
  const steps: WalkthroughStep[] = baseSteps.map((step, index) => ({
    ...step,
    state: step.complete
      ? "complete"
      : step.attention
        ? "attention"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
  const currentStep = steps[currentIndex];
  const CurrentStepIcon = currentStep.icon;
  const completion = Math.round(
    (steps.filter((step) => step.state === "complete").length / steps.length) * 100,
  );
  const selectedCount = generation?.progress.selectedRepositoryCount ?? 0;
  const snapshottedCount = generation?.progress.snapshottedRepositoryCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-blue-50 via-white to-fuchsia-50/70 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-fuchsia-950/20 sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="size-3.5" />
              {t("contributor.walkthrough.eyebrow")}
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {t("contributor.walkthrough.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t("contributor.walkthrough.description")}
            </p>
          </div>
          <div className="min-w-48 rounded-xl border border-white/80 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">{t("contributor.completion.progressLabel")}</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{completion}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </section>

      <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.id} className={`rounded-2xl border p-4 ${step.state === "current" ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/30" : step.state === "attention" ? "border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/20" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className={`flex size-9 items-center justify-center rounded-xl ${step.state === "complete" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : step.state === "attention" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"}`}>
                  {step.state === "complete" ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span className="font-mono text-[11px] text-slate-400">0{index + 1}</span>
              </div>
              <h2 className="mt-3 text-sm font-bold text-slate-950 dark:text-white">{step.title}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-8 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CurrentStepIcon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t("contributor.walkthrough.nextStep")}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{currentStep.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{currentStep.description}</p>
            </div>
          </div>

          {analysisActive && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200"><Clock3 className="size-4" />{t("contributor.walkthrough.analysisRunning")}</div>
              <p className="mt-1 text-xs text-blue-700/80 dark:text-blue-300/80">{t("contributor.walkthrough.repositoryProgress", { done: snapshottedCount, total: selectedCount })}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            {currentStep.id === "profile" && <Button asChild><Link to={profileEditHref}>{t("contributor.walkthrough.editProfile")}<ArrowRight className="size-4 rtl:rotate-180" /></Link></Button>}
            {(currentStep.id === "github" || currentStep.id === "analysis") && <Button asChild><Link to={analysisHref}>{analysisNeedsAttention ? t("contributor.walkthrough.retryAnalysis") : t("contributor.walkthrough.openAnalysis")}<ArrowRight className="size-4 rtl:rotate-180" /></Link></Button>}
            {currentStep.id === "review" && <Button asChild><Link to={exploreHref}>{t("contributor.onboarding.reviewExplore")}<ArrowRight className="size-4 rtl:rotate-180" /></Link></Button>}
            {reviewDecided && <Button asChild><Link to={dashboardHref}>{t("contributor.onboarding.decisionGoToDashboard")}<ArrowRight className="size-4 rtl:rotate-180" /></Link></Button>}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
          <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t("contributor.walkthrough.liveSummary")}</h2>
          <dl className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
            <SummaryRow label={t("contributor.walkthrough.githubAccess")} value={githubReady ? t("common.connected") : t("common.disconnected")} positive={githubReady} />
            <SummaryRow label={t("contributor.walkthrough.repositoriesSelected")} value={String(selectedCount)} positive={selectedCount > 0} />
            <SummaryRow label={t("contributor.walkthrough.generatedSkills")} value={String(generation?.skills.length ?? profile.skills.length)} positive={(generation?.skills.length ?? profile.skills.length) > 0} />
            <SummaryRow label={t("contributor.walkthrough.approvedSkills")} value={String(approvedSkills.length)} positive={approvedSkills.length > 0} />
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            {t("contributor.walkthrough.humanReviewNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="inline-flex items-center gap-1.5 font-semibold text-slate-950 dark:text-white">
        {positive ? <Check className="size-3.5 text-emerald-600" /> : <Circle className="size-3.5 text-slate-300 dark:text-slate-600" />}
        {value}
      </dd>
    </div>
  );
}
