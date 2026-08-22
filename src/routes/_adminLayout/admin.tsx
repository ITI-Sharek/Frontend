import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  useAdminIdentityVerificationsQuery,
  AdminIdentityVerificationsPanel,
} from "@/modules/admin-identity";
import {
  AdminDashboardView,
  AdminQuickCreateDialog
} from "@/modules/admin-dashboard";
import type {AdminDashboardTabId, DashboardMetrics, QuickCreateTab} from "@/modules/admin-dashboard";
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
  AdminSkillReviewSummary,
} from "@/modules/skill-profiles";
import { Button } from "@/shared/components/ui/button";

interface AdminDashboardSearch {
  tab?: string;
}

export const Route = createFileRoute("/_adminLayout/admin")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  validateSearch: (search: Record<string, unknown>): AdminDashboardSearch => {
    const raw = typeof search.tab === "string" ? search.tab : undefined;
    return raw ? { tab: raw } : {};
  },
  component: AdminRoute,
});

function AdminRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, ""),
  });

  return pathname === ROUTES.admin ? <AdminDashboardPage /> : <Outlet />;
}

function AdminDashboardPage() {
  const { t } = useTranslation();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();

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

  function handleOpenQuickCreate(nextTab: QuickCreateTab = "category") {
    setQuickCreateTab(nextTab);
    setQuickCreateOpen(true);
  }

  function handleRefresh() {
    void identityVerificationsQuery.refetch();
    void pendingSkillReviewsQuery.refetch();
    void categoriesQuery.refetch();
    void experienceLevelsQuery.refetch();
    void projectOwnersQuery.refetch();
  }

  const isRefreshing =
    identityVerificationsQuery.isFetching ||
    pendingSkillReviewsQuery.isFetching ||
    categoriesQuery.isFetching ||
    experienceLevelsQuery.isFetching ||
    projectOwnersQuery.isFetching;

  return (
    <>
      <AdminDashboardView
        initialTab={tab}
        onTabChange={(newTab: AdminDashboardTabId) => {
          void navigate({
            search: newTab === "overview" ? {} : { tab: newTab },
            replace: true,
          });
        }}
        metrics={metrics}
        pendingVerifications={pendingVerificationItems}
        isVerificationsLoading={identityVerificationsQuery.isLoading}
        isSkillsLoading={pendingSkillReviewsQuery.isLoading}
        isTaxonomyLoading={categoriesQuery.isLoading}
        isLevelsLoading={experienceLevelsQuery.isLoading}
        isOwnersLoading={projectOwnersQuery.isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenQuickCreate={handleOpenQuickCreate}
        skillReviewSummarySlot={<AdminSkillReviewSummary />}
        ownersPanelSlot={<AdminPublishedProjectOwnersPanel />}
        verificationsPanel={<AdminIdentityVerificationsPanel />}
        skillsPanel={
          pendingSkillReviewsQuery.isPending ? (
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
          )
        }
        taxonomyPanel={<AdminContributorFieldsPanel />}
        levelsPanel={<AdminExperienceLevelsPanel />}
        ownersPanel={<AdminPublishedProjectOwnersPanel />}
      />

      {/* Global Quick Create Modal */}
      <AdminQuickCreateDialog
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        initialTab={quickCreateTab}
      />
    </>
  );
}
