import { BadgeCheck, Compass, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";

import { AttentionFeed } from "./attention-feed";
import { DashboardSummary } from "./dashboard-summary";
import { MatchedTasksSection } from "./matched-tasks-section";
import { OnboardingChecklist } from "./onboarding-checklist";
import type { ContributorDashboardDto } from "../types/dashboard.types";

/** One figure on the hero band. Deliberately quiet — the greeting leads. */
function HeroStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-[color-mix(in_srgb,var(--hero-from)_55%,transparent)] px-4 py-3.5">
      <dd className="tnum text-2xl font-extrabold tracking-tight text-hero-ink">
        {value}
      </dd>
      <dt className="mt-0.5 text-[11px] font-medium leading-4 text-hero-ink-soft">
        {label}
      </dt>
    </div>
  );
}

/**
 * WF-02 contributor dashboard. Layout re-composes by lifecycle state:
 * A (active): attention → matched tasks → growth/applications.
 * B (onboarding): the dashboard IS the checklist.
 * C (verified, zero applications): matched-tasks hero + growth path.
 */
export function ContributorDashboardView({
  dashboard,
  deliveryLifecycleSlot,
}: {
  dashboard: ContributorDashboardDto;
  deliveryLifecycleSlot?: ReactNode;
}) {
  const { t } = useTranslation();
  const headerAction =
    dashboard.state === "onboarding" ? (
      <Button asChild size="lg" variant="evidence" className="w-full rounded-full sm:w-auto">
        <Link to={ROUTES.onboarding}>{t("dashboard.continueSetup")}</Link>
      </Button>
    ) : dashboard.state === "active" && dashboard.attentionItems.length === 0 ? (
      <Button asChild size="lg" variant="evidence" className="w-full rounded-full sm:w-auto">
        <Link to={ROUTES.tasks}>
          <Compass className="size-4" aria-hidden />
          {t("dashboard.exploreRequests")}
          <DirectionalArrow />
        </Link>
      </Button>
    ) : null;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 px-4 py-6 md:px-6 md:py-8">
      {/*
       * The greeting band. The workspace used to open with black type on the
       * page background, which gave the reader no anchor; a deep brand surface
       * carrying the greeting, the record so far and the day's one action
       * establishes where they are before they read a word.
       */}
      <header className="sk-hero px-5 py-7 md:px-9 md:py-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-evidence-teal">
              {t("dashboard.title")}
            </p>
            <h1 className="mt-2.5 text-balance text-[28px] font-extrabold leading-[1.12] tracking-tight text-hero-ink md:text-[40px]">
              {t("dashboard.greeting", { name: dashboard.greetingName })}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-[15px] leading-7 text-hero-ink-soft">
              {t("dashboard.description")}
            </p>
            {headerAction ? <div className="mt-6">{headerAction}</div> : null}
          </div>

          {/* The record so far, restated on the band the eye lands on first. */}
          <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 lg:min-w-[22rem]">
            <HeroStat
              label={t("contributor.reputation.completedContributions")}
              value={dashboard.growth.completedCount}
            />
            <HeroStat
              label={t("dashboard.growth.rating")}
              value={dashboard.growth.ratingCurrent?.toFixed(1) ?? "—"}
            />
            <HeroStat
              label={t("dashboard.applications.pendingOwnerReview")}
              value={dashboard.applications.pendingOwnerReviewCount}
            />
          </dl>
        </div>
      </header>

      {dashboard.state === "onboarding" && (
        <OnboardingChecklist steps={dashboard.onboardingSteps} />
      )}

      {dashboard.state === "verified-empty" && (
        <>
          {/*
           * The one moment the product gets to celebrate: a verified profile
           * with matches waiting. Teal is load-bearing here — it is the only
           * full-width teal surface in the app, and it means "the platform
           * checked, and you are cleared".
           */}
          <section
            data-spine="verified"
            className="relative overflow-hidden rounded-card border border-evidence-teal/35 bg-evidence-soft p-6 sm:p-8"
          >
            <span
              aria-hidden
              className="sk-dotgrid pointer-events-none absolute inset-y-0 end-0 hidden w-56 opacity-70 sm:block"
            />
            <p className="relative flex items-center gap-2 text-sm font-bold text-evidence-soft-foreground">
              <BadgeCheck className="size-4" />
              {t("dashboard.profileVerified")}
            </p>
            <h2 className="relative mt-3 max-w-2xl text-balance text-2xl font-bold leading-tight text-foreground">
              {t("dashboard.matchedTasksToday", {
                count: dashboard.fullyMatchedTasksCount,
              })}
            </h2>
            <p className="relative mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
              {t("dashboard.verifiedDescription")}
            </p>
            <Button asChild size="sm" className="relative mt-5">
              <Link to={ROUTES.tasks}>
                {t("dashboard.viewThem")}
                <DirectionalArrow />
              </Link>
            </Button>
          </section>
          <DashboardSummary
            growth={dashboard.growth}
            applications={dashboard.applications}
            showGrowthPath
          />
        </>
      )}

      {dashboard.state === "active" && (
        <>
          <AttentionFeed items={dashboard.attentionItems} />
          {deliveryLifecycleSlot}
          <MatchedTasksSection
            tasks={dashboard.matchedTasks}
            matchReason={dashboard.matchReason}
          />
          <DashboardSummary
            growth={dashboard.growth}
            applications={dashboard.applications}
          />
          <p className="flex items-start gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-evidence-teal"
              aria-hidden
            />
            {t("dashboard.advisoryNote")}
          </p>
        </>
      )}
    </div>
  );
}
