import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { AdminPublishedProjectOwnersPanel } from "@/modules/projects";
import { AdminSkillReviewSummary } from "@/modules/skill-profiles";
import type { AdminIdentityVerificationItemDto } from "@/modules/admin-identity";

import type { DashboardMetrics } from "./admin-dashboard-hero";

interface AdminOverviewTabProps {
  metrics: DashboardMetrics;
  pendingVerifications: AdminIdentityVerificationItemDto[];
  onSelectTab: (tab: string) => void;
  onOpenQuickCreate: (tab?: "category" | "field" | "level") => void;
  isVerificationsLoading?: boolean;
}

export function AdminOverviewTab({
  metrics,
  pendingVerifications,
  onSelectTab,
  onOpenQuickCreate,
  isVerificationsLoading,
}: AdminOverviewTabProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const hasUrgentActions =
    metrics.pendingVerifications > 0 || metrics.pendingSkills > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Urgency / Attention Required Banner */}
      {hasUrgentActions && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("admin.dashboard.urgency.title", "Action Required")}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {metrics.pendingVerifications > 0 && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-200">
                      • {t("admin.dashboard.urgency.pendingVerifications", {
                        count: metrics.pendingVerifications,
                      })}
                    </span>
                  )}
                  {metrics.pendingSkills > 0 && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                      • {t("admin.dashboard.urgency.pendingSkills", {
                        count: metrics.pendingSkills,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {metrics.pendingVerifications > 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onSelectTab("verifications")}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  {t("admin.dashboard.kpi.verificationsAction", "Review Identities")}
                </Button>
              )}
              {metrics.pendingSkills > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectTab("skills")}
                  className="rounded-xl border-border bg-card text-xs font-semibold shadow-2xs"
                >
                  {t("admin.dashboard.kpi.skillsAction", "Review Skills")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Shortcuts Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>{t("admin.dashboard.shortcuts.title", "Quick Shortcuts")}</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Shortcut 1: Verify Identities */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Shield className="size-4.5" />
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {metrics.pendingVerifications} {t("admin.dashboard.kpi.verificationsPending", "pending")}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {t("admin.dashboard.shortcuts.reviewIdentity", "Verify Identities")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(
                  "admin.dashboard.shortcuts.reviewIdentityDesc",
                  "Inspect national identity documents & approve users",
                )}
              </p>
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("verifications")}
                className="w-full justify-between rounded-xl px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <span>{t("admin.dashboard.kpi.verificationsAction", "Review Requests")}</span>
                <DirectionalArrow className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Shortcut 2: Review Skills */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardCheck className="size-4.5" />
                </span>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {metrics.pendingSkills} {t("admin.dashboard.kpi.skillsPending", "pending")}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {t("admin.dashboard.shortcuts.reviewSkills", "Review Skills")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(
                  "admin.dashboard.shortcuts.reviewSkillsDesc",
                  "Audit AI extracted GitHub skill evidence",
                )}
              </p>
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("skills")}
                className="w-full justify-between rounded-xl px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <span>{t("admin.dashboard.kpi.skillsAction", "Open Queue")}</span>
                <DirectionalArrow className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Shortcut 3: Contributor Categories */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Layers className="size-4.5" />
                </span>
                <button
                  type="button"
                  onClick={() => onOpenQuickCreate("category")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                >
                  <Plus className="size-3" />
                  <span>{t("admin.dashboard.quickCreate.tabCategory", "Category")}</span>
                </button>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {t("admin.dashboard.shortcuts.manageFields", "Contributor Categories")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(
                  "admin.dashboard.shortcuts.manageFieldsDesc",
                  "Add, edit, and reorder skill categories & fields",
                )}
              </p>
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("taxonomy")}
                className="w-full justify-between rounded-xl px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <span>{t("admin.dashboard.kpi.taxonomyAction", "Manage Fields")}</span>
                <DirectionalArrow className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Shortcut 4: Experience Levels */}
          <div className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Award className="size-4.5" />
                </span>
                <button
                  type="button"
                  onClick={() => onOpenQuickCreate("level")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                >
                  <Plus className="size-3" />
                  <span>{t("admin.dashboard.quickCreate.tabLevel", "Level")}</span>
                </button>
              </div>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {t("admin.dashboard.shortcuts.manageLevels", "Experience Levels")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(
                  "admin.dashboard.shortcuts.manageLevelsDesc",
                  "Configure seniority levels & display sorting",
                )}
              </p>
            </div>

            <div className="mt-4 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("levels")}
                className="w-full justify-between rounded-xl px-2 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <span>{t("admin.dashboard.kpi.levelsAction", "Manage Levels")}</span>
                <DirectionalArrow className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Live Review Feed */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Identity Verifications */}
        <section
          aria-labelledby="recent-verifications-heading"
          className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xs"
        >
          <div className="flex items-center justify-between border-b border-border p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Shield className="size-4.5" />
              </span>
              <div>
                <h2 id="recent-verifications-heading" className="text-base font-bold text-foreground">
                  {t(
                    "admin.dashboard.recentSection.identityTitle",
                    "Recent Identity Verification Requests",
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {metrics.pendingVerifications}{" "}
                  {t("admin.dashboard.kpi.verificationsPending", "awaiting review")}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelectTab("verifications")}
              className="rounded-xl text-xs"
            >
              {t("admin.dashboard.recentSection.viewAll", "View all")}
            </Button>
          </div>

          {isVerificationsLoading ? (
            <p className="p-6 text-center text-xs text-muted-foreground">
              {t("common.loading", "Loading...")}
            </p>
          ) : pendingVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <p className="text-xs font-semibold text-foreground">
                {t("admin.dashboard.recentSection.identityEmpty", "No pending identity verifications")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isArabic
                  ? "جميع طلبات التحقق من الهوية تمت مراجعتها."
                  : "All identity verification submissions have been processed."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingVerifications.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 px-5 transition-colors hover:bg-surface-muted/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={item.avatarUrl}
                      alt={`${item.firstName} ${item.lastName}`}
                      fallback={item.firstName.charAt(0) || "U"}
                      className="size-9 shrink-0 text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {item.firstName} {item.lastName}
                      </p>
                      <p
                        dir="ltr"
                        className="truncate text-left text-[11px] text-muted-foreground"
                      >
                        {item.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectTab("verifications")}
                    className="shrink-0 rounded-xl text-xs gap-1"
                  >
                    <span>{t("admin.dashboard.kpi.verificationsAction", "Review")}</span>
                    <DirectionalArrow className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Skill Reviews Summary */}
        <div>
          <AdminSkillReviewSummary />
        </div>
      </div>

      {/* Full-Width Section: Published Project Owners */}
      <div>
        <AdminPublishedProjectOwnersPanel />
      </div>
    </div>
  );
}
