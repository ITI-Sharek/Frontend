import {
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Layers,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { Button } from "@/shared/components/ui/button";

export interface DashboardMetrics {
  pendingVerifications: number;
  verifiedIdentities: number;
  pendingSkills: number;
  oldestSkillWait?: string;
  totalCategories: number;
  totalFields: number;
  totalLevels: number;
  publishedOwners: number;
}

interface AdminDashboardHeroProps {
  metrics: DashboardMetrics;
  onSelectTab: (tab: string) => void;
  onOpenQuickCreate: () => void;
  isVerificationsLoading?: boolean;
  isSkillsLoading?: boolean;
  isTaxonomyLoading?: boolean;
  isLevelsLoading?: boolean;
  isOwnersLoading?: boolean;
}

export function AdminDashboardHero({
  metrics,
  onSelectTab,
  onOpenQuickCreate,
  isVerificationsLoading,
  isSkillsLoading,
  isTaxonomyLoading,
  isLevelsLoading,
  isOwnersLoading,
}: AdminDashboardHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner with Title, Status & Quick Action Buttons */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary-soft/20 p-6 shadow-xs sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {t("admin.dashboard.quickStatus", "System Active")}
              </span>
              <span className="text-xs text-muted-foreground">
                • {t("workspace.adminBrandSubtitle", "Review operations")}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {t("admin.dashboard.title", "Admin Command Center")}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(
                "admin.dashboard.description",
                "Unified operations for identity verification, skill approvals, contributor taxonomy, and project governance.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSelectTab("skills")}
              className="rounded-2xl border-border bg-card/60 backdrop-blur-sm hover:bg-card px-4 py-2.5 text-xs font-semibold gap-2 shadow-2xs"
            >
              <ClipboardCheck className="size-4 text-primary" />
              <span>{t("admin.dashboard.kpi.skillsAction", "Open Queue")}</span>
            </Button>

            <Button
              type="button"
              onClick={onOpenQuickCreate}
              className="rounded-2xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs gap-2 transition-all hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span>{t("admin.dashboard.quickActionAdd", "Quick Create")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 5 KPI Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Card 1: Identity Verifications */}
        <button
          type="button"
          onClick={() => onSelectTab("verifications")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 text-start shadow-2xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="size-5" />
            </span>
            {metrics.pendingVerifications > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                {metrics.pendingVerifications} {t("admin.dashboard.kpi.verificationsPending", "Pending")}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {isVerificationsLoading ? "…" : metrics.pendingVerifications}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("admin.dashboard.kpi.verificationsTitle", "Identity Verifications")}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
            <span className="text-muted-foreground">
              {metrics.verifiedIdentities} {t("admin.dashboard.kpi.verificationsVerified", "Verified")}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              {t("admin.dashboard.kpi.verificationsAction", "Review")}
              <DirectionalArrow className="size-3" />
            </span>
          </div>
        </button>

        {/* Card 2: Skill Reviews */}
        <button
          type="button"
          onClick={() => onSelectTab("skills")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 text-start shadow-2xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <ClipboardCheck className="size-5" />
            </span>
            {metrics.pendingSkills > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                {metrics.pendingSkills} {t("admin.dashboard.kpi.skillsPending", "Pending")}
              </span>
            )}
          </div>

          <div className="mt-4">
            <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {isSkillsLoading ? "…" : metrics.pendingSkills}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("admin.dashboard.kpi.skillsTitle", "Skill Reviews")}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
            <span className="text-muted-foreground truncate">
              {metrics.oldestSkillWait
                ? `${t("admin.dashboard.kpi.skillsOldest", "Wait:")} ${metrics.oldestSkillWait}`
                : t("skillProfile.waitingAge.unknown", "—")}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              {t("admin.dashboard.kpi.skillsAction", "Queue")}
              <DirectionalArrow className="size-3" />
            </span>
          </div>
        </button>

        {/* Card 3: Taxonomy & Fields */}
        <button
          type="button"
          onClick={() => onSelectTab("taxonomy")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 text-start shadow-2xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Layers className="size-5" />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              {metrics.totalCategories} {t("admin.dashboard.kpi.taxonomyCategories", "Categories")}
            </span>
          </div>

          <div className="mt-4">
            <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {isTaxonomyLoading ? "…" : metrics.totalFields}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("admin.dashboard.kpi.taxonomyTitle", "Contributor Fields")}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
            <span className="text-muted-foreground">
              {metrics.totalFields} {t("admin.dashboard.kpi.taxonomyFields", "Fields")}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              {t("admin.dashboard.kpi.taxonomyAction", "Manage")}
              <DirectionalArrow className="size-3" />
            </span>
          </div>
        </button>

        {/* Card 4: Experience Levels */}
        <button
          type="button"
          onClick={() => onSelectTab("levels")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 text-start shadow-2xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Award className="size-5" />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
              {t("admin.dashboard.kpi.levelsActive", "Active")}
            </span>
          </div>

          <div className="mt-4">
            <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {isLevelsLoading ? "…" : metrics.totalLevels}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("admin.dashboard.kpi.levelsTitle", "Experience Levels")}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
            <span className="text-muted-foreground">
              {metrics.totalLevels} {t("adminPages.experienceLevelsTitle", "Levels")}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              {t("admin.dashboard.kpi.levelsAction", "Manage")}
              <DirectionalArrow className="size-3" />
            </span>
          </div>
        </button>

        {/* Card 5: Project Owners */}
        <button
          type="button"
          onClick={() => onSelectTab("owners")}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 text-start shadow-2xs transition-all hover:border-primary/50 hover:bg-surface-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <BriefcaseBusiness className="size-5" />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              {t("projectOwners.publishedProjects", "Projects")}
            </span>
          </div>

          <div className="mt-4">
            <p className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {isOwnersLoading ? "…" : metrics.publishedOwners}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("admin.dashboard.kpi.ownersTitle", "Project Owners")}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
            <span className="text-muted-foreground">
              {metrics.publishedOwners} {t("admin.dashboard.kpi.ownersActive", "Owners")}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
              {t("admin.dashboard.kpi.ownersAction", "View")}
              <DirectionalArrow className="size-3" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
