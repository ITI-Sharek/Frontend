import { BadgeCheck, Bell, ChevronLeft } from "lucide-react";

import { Avatar } from "@/shared/components/ui/avatar";
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
}: {
  dashboard: ContributorDashboardDto;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">
          صباح الخير، {dashboard.greetingName}
        </h1>
        <div className="flex items-center gap-4">
          <span className="relative text-muted-foreground">
            <Bell className="size-5" />
            {dashboard.unreadNotifications > 0 && (
              <span className="absolute -top-1.5 -left-2 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white">
                {dashboard.unreadNotifications}
              </span>
            )}
          </span>
          <Avatar size="md" fallback={dashboard.greetingName.slice(0, 1)} />
        </div>
      </header>

      {dashboard.state === "onboarding" && (
        <OnboardingChecklist steps={dashboard.onboardingSteps} />
      )}

      {dashboard.state === "verified-empty" && (
        <>
          <section className="rounded-card border border-primary/40 bg-primary/5 p-6">
            <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-primary">
              <BadgeCheck className="size-4" />
              ملفك موثق
            </p>
            <h2 className="mt-2 text-xl font-bold text-foreground">
              {dashboard.fullyMatchedTasksCount} مهام تطابق مهاراتك بالكامل
              اليوم
            </h2>
            <Button size="sm" className="mt-4">
              اعرضها
              <ChevronLeft className="size-4" />
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
          <MatchedTasksSection
            tasks={dashboard.matchedTasks}
            matchReason={dashboard.matchReason}
          />
          <DashboardSummary
            growth={dashboard.growth}
            applications={dashboard.applications}
          />
        </>
      )}
    </div>
  );
}
