import { ArrowLeft, BadgeCheck, Compass, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

import { AttentionFeed } from "./attention-feed";
import { DashboardSummary } from "./dashboard-summary";
import { MatchedTasksSection } from "./matched-tasks-section";
import { OnboardingChecklist } from "./onboarding-checklist";
import type { ContributorDashboardDto } from "../types/dashboard.types";

/**
 * WF-02 contributor dashboard. Layout re-composes by lifecycle state:
 * A (active): attention → matched tasks → growth/applications.
 * B (onboarding): the dashboard IS the checklist.
 * C (verified, zero applications): matched-tasks hero + growth path.
 */
export function ContributorDashboardView({
  dashboard,
  recommendedSlot,
}: {
  dashboard: ContributorDashboardDto;
  recommendedSlot?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold text-primary">
            لوحة المساهم
          </p>
          <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            أهلاً، {dashboard.greetingName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            ابدأ بما يحتاج قراراً منك، ثم راجع فرص المساهمة المطابقة لمهاراتك.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to={ROUTES.tasks}>
            <Compass className="size-4" aria-hidden />
            استكشف طلبات المساهمة
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Button>
      </header>

      {dashboard.state === "onboarding" && (
        <OnboardingChecklist steps={dashboard.onboardingSteps} />
      )}

      {dashboard.state === "verified-empty" && (
        <>
          <section className="relative overflow-hidden rounded-card border border-evidence-teal/40 bg-card p-6 sm:p-8">
            <div
              className="absolute inset-y-0 start-0 w-1 bg-evidence-teal"
              aria-hidden
            />
            <p className="flex items-center gap-2 text-sm font-semibold text-evidence-teal-foreground dark:text-evidence-teal">
              <BadgeCheck className="size-4" />
              ملفك موثق
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-foreground">
              {dashboard.fullyMatchedTasksCount} مهام تطابق مهاراتك بالكامل
              اليوم
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              ملفك جاهز. راجع النطاق والمتطلبات قبل أن تختار أول مساهمة لك.
            </p>
            <Button asChild size="sm" className="mt-5">
              <Link to={ROUTES.tasks}>
                اعرض المطابقات
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </section>
          <DashboardSummary
            growth={dashboard.growth}
            applications={dashboard.applications}
            showGrowthPath
          />
          {recommendedSlot}
        </>
      )}

      {dashboard.state === "active" && (
        <>
          <nav
            aria-label="أقسام لوحة التحكم"
            className="-mt-2 flex gap-1 overflow-x-auto border-b border-border"
          >
            <a
              href="#attention"
              className="shrink-0 border-b-2 border-primary px-3 py-3 text-sm font-semibold text-primary"
            >
              يحتاج انتباهك
            </a>
            <a
              href="#matches"
              className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              فرص مناسبة
            </a>
            <a
              href="#record"
              className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              سجلك
            </a>
          </nav>
          <AttentionFeed items={dashboard.attentionItems} />
          <MatchedTasksSection
            tasks={dashboard.matchedTasks}
            matchReason={dashboard.matchReason}
          />
          <DashboardSummary
            growth={dashboard.growth}
            applications={dashboard.applications}
          />
          {recommendedSlot}
          <p className="flex items-start gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-evidence-teal"
              aria-hidden
            />
            تظهر المطابقات بناءً على المهارات الموثقة، لكنها تظل إرشادية. راجع
            متطلبات كل طلب قبل التقديم.
          </p>
        </>
      )}
    </div>
  );
}
