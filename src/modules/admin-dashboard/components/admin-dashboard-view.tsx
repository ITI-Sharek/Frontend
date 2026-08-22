import {
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

import type { AdminIdentityVerificationItemDto } from "@/modules/admin-identity";

import type { DashboardMetrics } from "./admin-dashboard-hero";
import { AdminDashboardHero } from "./admin-dashboard-hero";
import { AdminOverviewTab } from "./admin-overview-tab";
import type { QuickCreateTab } from "./admin-quick-create-dialog";

export type AdminDashboardTabId =
  | "overview"
  | "verifications"
  | "skills"
  | "taxonomy"
  | "levels"
  | "owners";

interface AdminDashboardViewProps {
  initialTab?: string;
  onTabChange?: (tab: AdminDashboardTabId) => void;
  metrics: DashboardMetrics;
  pendingVerifications: AdminIdentityVerificationItemDto[];
  isVerificationsLoading: boolean;
  isSkillsLoading: boolean;
  isTaxonomyLoading: boolean;
  isLevelsLoading: boolean;
  isOwnersLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenQuickCreate: (tab?: QuickCreateTab) => void;
  skillReviewSummarySlot: ReactNode;
  ownersPanelSlot: ReactNode;
  verificationsPanel: ReactNode;
  skillsPanel: ReactNode;
  taxonomyPanel: ReactNode;
  levelsPanel: ReactNode;
  ownersPanel: ReactNode;
}

export function AdminDashboardView({
  initialTab = "overview",
  onTabChange,
  metrics,
  pendingVerifications,
  isVerificationsLoading,
  isSkillsLoading,
  isTaxonomyLoading,
  isLevelsLoading,
  isOwnersLoading,
  isRefreshing,
  onRefresh,
  onOpenQuickCreate,
  skillReviewSummarySlot,
  ownersPanelSlot,
  verificationsPanel,
  skillsPanel,
  taxonomyPanel,
  levelsPanel,
  ownersPanel,
}: AdminDashboardViewProps) {
  const { t } = useTranslation();

  const validTabs: AdminDashboardTabId[] = [
    "overview",
    "verifications",
    "skills",
    "taxonomy",
    "levels",
    "owners",
  ];

  const [activeTab, setActiveTab] = useState<AdminDashboardTabId>(
    validTabs.includes(initialTab as AdminDashboardTabId)
      ? (initialTab as AdminDashboardTabId)
      : "overview",
  );

  function handleSelectTab(tabId: string) {
    if (validTabs.includes(tabId as AdminDashboardTabId)) {
      const validId = tabId as AdminDashboardTabId;
      setActiveTab(validId);
      onTabChange?.(validId);
    }
  }

  const tabsConfig = [
    {
      id: "overview" as const,
      label: t("admin.dashboard.tabs.overview", "Overview & Actions"),
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: "verifications" as const,
      label: t("admin.dashboard.tabs.verifications", "Identity Verifications"),
      icon: Shield,
      badge: metrics.pendingVerifications > 0 ? metrics.pendingVerifications : undefined,
      badgeAccent: true,
    },
    {
      id: "skills" as const,
      label: t("admin.dashboard.tabs.skills", "Skill Reviews"),
      icon: ClipboardCheck,
      badge: metrics.pendingSkills > 0 ? metrics.pendingSkills : undefined,
      badgeAccent: true,
    },
    {
      id: "taxonomy" as const,
      label: t("admin.dashboard.tabs.taxonomy", "Taxonomy & Fields"),
      icon: Layers,
      badge: metrics.totalCategories > 0 ? metrics.totalCategories : undefined,
    },
    {
      id: "levels" as const,
      label: t("admin.dashboard.tabs.levels", "Experience Levels"),
      icon: Award,
      badge: metrics.totalLevels > 0 ? metrics.totalLevels : undefined,
    },
    {
      id: "owners" as const,
      label: t("admin.dashboard.tabs.owners", "Project Owners"),
      icon: BriefcaseBusiness,
      badge: metrics.publishedOwners > 0 ? metrics.publishedOwners : undefined,
    },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-8 pb-12">
        {/* Hero Section with KPIs */}
        <AdminDashboardHero
          metrics={metrics}
          onSelectTab={handleSelectTab}
          onOpenQuickCreate={() => onOpenQuickCreate("category")}
          isVerificationsLoading={isVerificationsLoading}
          isSkillsLoading={isSkillsLoading}
          isTaxonomyLoading={isTaxonomyLoading}
          isLevelsLoading={isLevelsLoading}
          isOwnersLoading={isOwnersLoading}
        />

        {/* Interactive Workspace Navigation Tabs */}
        <div className="flex flex-col gap-4 border-b border-border pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label={t("adminLayout.navigationLabel", "Administration tabs")}
              className="flex flex-wrap items-center gap-1.5"
            >
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-surface-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`rounded-full px-1 py-0.2 text-[10px] font-bold ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : tab.badgeAccent
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="rounded-2xl text-xs gap-1.5 shadow-2xs"
              >
                <RefreshCw
                  className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">{t("common.refresh", "Refresh")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Active Tab Panel Content */}
        <div>
          {activeTab === "overview" && (
            <AdminOverviewTab
              metrics={metrics}
              pendingVerifications={pendingVerifications}
              onSelectTab={handleSelectTab}
              onOpenQuickCreate={onOpenQuickCreate}
              isVerificationsLoading={isVerificationsLoading}
              skillReviewSummarySlot={skillReviewSummarySlot}
              ownersPanelSlot={ownersPanelSlot}
            />
          )}

          {activeTab === "verifications" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              {verificationsPanel}
            </div>
          )}

          {activeTab === "skills" && <div>{skillsPanel}</div>}

          {activeTab === "taxonomy" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              {taxonomyPanel}
            </div>
          )}

          {activeTab === "levels" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              {levelsPanel}
            </div>
          )}

          {activeTab === "owners" && <div>{ownersPanel}</div>}
        </div>
      </div>
    </PageContainer>
  );
}
