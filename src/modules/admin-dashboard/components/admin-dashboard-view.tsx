import {
  Award,
  BriefcaseBusiness,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useAdminIdentityVerificationsQuery,
  AdminIdentityVerificationsPanel,
} from "@/modules/admin-identity";
import {
  useAdminContributorFieldCategoriesQuery,
  useAdminExperienceLevelsQuery,
  AdminContributorFieldsPanel,
  AdminExperienceLevelsPanel,
} from "@/modules/contributors";
import {
  useAdminPublishedProjectOwnersQuery,
  AdminPublishedProjectOwnersPanel,
} from "@/modules/projects";
import {
  useAdminPendingSkillReviewsQuery,
  formatWaitingAge,
  groupPendingSkillReviews,
  AdminSkillReviewQueue,
} from "@/modules/skill-profiles";
import { PageContainer } from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";

import type { DashboardMetrics } from "./admin-dashboard-hero";
import { AdminDashboardHero } from "./admin-dashboard-hero";
import { AdminOverviewTab } from "./admin-overview-tab";
import type { QuickCreateTab } from "./admin-quick-create-dialog";
import { AdminQuickCreateDialog } from "./admin-quick-create-dialog";

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
}

export function AdminDashboardView({
  initialTab = "overview",
  onTabChange,
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

  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateTab, setQuickCreateTab] = useState<QuickCreateTab>("category");

  // Data Queries
  const identityVerificationsQuery = useAdminIdentityVerificationsQuery({
    status: "all",
    limit: 50,
  });
  const pendingSkillReviewsQuery = useAdminPendingSkillReviewsQuery({
    page: 1,
    limit: 50,
  });
  const categoriesQuery = useAdminContributorFieldCategoriesQuery();
  const experienceLevelsQuery = useAdminExperienceLevelsQuery();
  const projectOwnersQuery = useAdminPublishedProjectOwnersQuery();

  // Metrics computation
  const metrics: DashboardMetrics = useMemo(() => {
    const allVerifications = identityVerificationsQuery.data?.items ?? [];
    const pendingVerifications = allVerifications.filter(
      (v) => v.identityVerificationStatus === "pending",
    ).length;
    const verifiedIdentities = allVerifications.filter(
      (v) => v.identityVerificationStatus === "verified",
    ).length;

    const skillGroups = groupPendingSkillReviews(
      t,
      pendingSkillReviewsQuery.data?.items ?? [],
    );
    const oldestPending = skillGroups[0]?.oldestCreatedAt;
    const oldestSkillWait = oldestPending
      ? formatWaitingAge(t, oldestPending)
      : undefined;

    const categories = categoriesQuery.data ?? [];
    const totalFields = categories.reduce(
      (acc, cat) => acc + cat.fields.length,
      0,
    );

    return {
      pendingVerifications,
      verifiedIdentities,
      pendingSkills: pendingSkillReviewsQuery.data?.total ?? 0,
      oldestSkillWait,
      totalCategories: categories.length,
      totalFields,
      totalLevels: experienceLevelsQuery.data?.length ?? 0,
      publishedOwners: projectOwnersQuery.data?.length ?? 0,
    };
  }, [
    identityVerificationsQuery.data,
    pendingSkillReviewsQuery.data,
    categoriesQuery.data,
    experienceLevelsQuery.data,
    projectOwnersQuery.data,
    t,
  ]);

  const pendingVerificationItems = useMemo(() => {
    const all = identityVerificationsQuery.data?.items ?? [];
    return all.filter((i) => i.identityVerificationStatus === "pending");
  }, [identityVerificationsQuery.data]);

  function handleSelectTab(tabId: string) {
    if (validTabs.includes(tabId as AdminDashboardTabId)) {
      const validId = tabId as AdminDashboardTabId;
      setActiveTab(validId);
      onTabChange?.(validId);
    }
  }

  function handleOpenQuickCreate(tab: QuickCreateTab = "category") {
    setQuickCreateTab(tab);
    setQuickCreateOpen(true);
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
          onOpenQuickCreate={() => handleOpenQuickCreate("category")}
          isVerificationsLoading={identityVerificationsQuery.isLoading}
          isSkillsLoading={pendingSkillReviewsQuery.isLoading}
          isTaxonomyLoading={categoriesQuery.isLoading}
          isLevelsLoading={experienceLevelsQuery.isLoading}
          isOwnersLoading={projectOwnersQuery.isLoading}
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
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
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
                onClick={() => {
                  void identityVerificationsQuery.refetch();
                  void pendingSkillReviewsQuery.refetch();
                  void categoriesQuery.refetch();
                  void experienceLevelsQuery.refetch();
                  void projectOwnersQuery.refetch();
                }}
                disabled={
                  identityVerificationsQuery.isFetching ||
                  pendingSkillReviewsQuery.isFetching ||
                  categoriesQuery.isFetching ||
                  experienceLevelsQuery.isFetching ||
                  projectOwnersQuery.isFetching
                }
                className="rounded-2xl text-xs gap-1.5 shadow-2xs"
              >
                <RefreshCw
                  className={`size-3.5 ${
                    identityVerificationsQuery.isFetching ||
                    pendingSkillReviewsQuery.isFetching ||
                    categoriesQuery.isFetching ||
                    experienceLevelsQuery.isFetching ||
                    projectOwnersQuery.isFetching
                      ? "animate-spin"
                      : ""
                  }`}
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
              pendingVerifications={pendingVerificationItems}
              onSelectTab={handleSelectTab}
              onOpenQuickCreate={handleOpenQuickCreate}
              isVerificationsLoading={identityVerificationsQuery.isLoading}
            />
          )}

          {activeTab === "verifications" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <AdminIdentityVerificationsPanel />
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              {pendingSkillReviewsQuery.isPending ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
                  {t("admin.skillReviews.loading", "Loading review queue…")}
                </div>
              ) : pendingSkillReviewsQuery.isError ? (
                <div className="rounded-3xl border border-border bg-card p-8 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {t("admin.skillReviews.loadError", "Could not load review queue")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void pendingSkillReviewsQuery.refetch()}
                    className="mt-3 rounded-xl text-xs"
                  >
                    {t("admin.skillReviews.retry", "Retry")}
                  </Button>
                </div>
              ) : (
                <AdminSkillReviewQueue
                  reviews={pendingSkillReviewsQuery.data}
                />
              )}
            </div>
          )}

          {activeTab === "taxonomy" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <AdminContributorFieldsPanel />
            </div>
          )}

          {activeTab === "levels" && (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <AdminExperienceLevelsPanel />
            </div>
          )}

          {activeTab === "owners" && (
            <div>
              <AdminPublishedProjectOwnersPanel />
            </div>
          )}
        </div>

        {/* Global Quick Create Modal */}
        <AdminQuickCreateDialog
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          initialTab={quickCreateTab}
        />
      </div>
    </PageContainer>
  );
}
