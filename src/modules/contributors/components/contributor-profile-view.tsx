import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ContributorBadgesCard } from "./contributor-badges-card";
import { ContributorCompletionCard } from "./contributor-completion-card";
import { ContributorGithubReposCard } from "./contributor-github-repos-card";
import { ContributorGithubSkillsSection } from "./contributor-github-skills-section";
import { ContributorProfileHeader } from "./contributor-profile-header";
import {
  ContributorAboutPanel,
  ContributorContributionsPanel,
  ContributorSkillsPanel,
} from "./contributor-profile-sections";
import { ContributorQuickActionsCard } from "./contributor-quick-actions-card";
import { ContributorRecentActivityCard } from "./contributor-recent-activity-card";
import { ContributorReputationStrip } from "./contributor-reputation-strip";
import { ContributorSkillProfileCard } from "./contributor-skill-profile-card";
import { ContributorStatsCard } from "./contributor-stats-card";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export type ProfileTabValue =
  | "overview"
  | "skills"
  | "repositories"
  | "projects"
  | "activity"
  | "reviews";

const TABS: { id: ProfileTabValue; labelKey: string }[] = [
  { id: "overview", labelKey: "contributor.dynamic.tabOverview" },
  { id: "skills", labelKey: "contributor.dynamic.tabSkills" },
  { id: "repositories", labelKey: "contributor.dynamic.tabRepositories" },
  { id: "projects", labelKey: "contributor.dynamic.tabContributions" },
  { id: "activity", labelKey: "contributor.dynamic.tabActivity" },
  { id: "reviews", labelKey: "contributor.dynamic.tabReputation" },
];

export function ContributorProfileView({
  profile,
  onLogout,
  activeSection,
  onSectionChange,
}: {
  profile: ContributorProfileDto;
  /** Injected by the route. Optional so public/viewer contexts can omit it. */
  onLogout?: () => void;
  activeSection?: ProfileTabValue;
  onSectionChange?: (section: ProfileTabValue) => void;
}) {
  const { t } = useTranslation();
  const [internalTab, setInternalTab] = useState<ProfileTabValue>("overview");
  const activeTab = activeSection ?? internalTab;

  function handleTabChange(val: ProfileTabValue) {
    if (onSectionChange) {
      onSectionChange(val);
    } else {
      setInternalTab(val);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. Identity Header Hero Card */}
      <ContributorProfileHeader profile={profile} onLogout={onLogout} />

      {/* 2. Navigation Tabs & Content */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => handleTabChange(val as ProfileTabValue)}
        className="w-full gap-0"
      >
        <div className="border-b border-slate-200/90 dark:border-slate-800">
          <TabsList
            variant="line"
            aria-label={t("contributor.profile.tabsAriaLabel") || "Profile sections"}
            className="flex h-auto w-full justify-start gap-8 bg-transparent p-0"
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                id={`profile-tab-${tab.id}`}
                className="relative -mb-px flex-none rounded-none border-b-2 border-transparent px-2 py-3.5 text-sm font-medium text-slate-600 shadow-none transition-colors hover:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-blue-600 dark:text-slate-400 dark:hover:text-white dark:data-[state=active]:border-blue-400 dark:data-[state=active]:text-blue-400"
              >
                {t(tab.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ——— Tab 1: Overview (Pixel-perfect replica of mockup) ——— */}
        <TabsContent
          value="overview"
          forceMount
          id="profile-panel-overview"
          aria-labelledby="profile-tab-overview"
          className={`mt-6 gap-6 ${activeTab === "overview" ? "grid grid-cols-1 lg:grid-cols-12" : "hidden"}`}
        >
          {/* Left Column (8 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <ContributorSkillProfileCard
              profile={profile}
              onViewFullProfile={() => handleTabChange("skills")}
            />
            <ContributorGithubReposCard
              profile={profile}
              onViewAll={() => handleTabChange("repositories")}
            />
            <ContributorRecentActivityCard
              profile={profile}
              onViewAll={() => handleTabChange("activity")}
            />
          </div>

          {/* Right Column (4 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ContributorCompletionCard profile={profile} />
            <ContributorQuickActionsCard profile={profile} />
            <ContributorStatsCard profile={profile} />
            <ContributorBadgesCard
              onViewAll={() => handleTabChange("reviews")}
            />
          </div>
        </TabsContent>

        {/* ——— Tab 2: Skills ——— */}
        <TabsContent
          value="skills"
          forceMount
          id="profile-panel-skills"
          aria-labelledby="profile-tab-skills"
          className={`mt-6 ${activeTab === "skills" ? "block" : "hidden"}`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ContributorSkillsPanel profile={profile} />
            </div>
            <div className="lg:col-span-4">
              <ContributorReputationStrip profile={profile} />
            </div>
          </div>
        </TabsContent>

        {/* ——— Tab 3: Repositories ——— */}
        <TabsContent
          value="repositories"
          forceMount
          id="profile-panel-repositories"
          aria-labelledby="profile-tab-repositories"
          className={`mt-6 ${activeTab === "repositories" ? "block" : "hidden"}`}
        >
          <div className="flex flex-col gap-6">
            <ContributorGithubReposCard profile={profile} />
            <ContributorGithubSkillsSection profile={profile} />
          </div>
        </TabsContent>

        {/* ——— Tab 4: Projects / Contributions ——— */}
        <TabsContent
          value="projects"
          forceMount
          id="profile-panel-projects"
          aria-labelledby="profile-tab-projects"
          className={`mt-6 ${activeTab === "projects" ? "block" : "hidden"}`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ContributorContributionsPanel profile={profile} />
            </div>
            <div className="lg:col-span-4">
              <ContributorStatsCard profile={profile} />
            </div>
          </div>
        </TabsContent>

        {/* ——— Tab 5: Activity ——— */}
        <TabsContent
          value="activity"
          forceMount
          id="profile-panel-activity"
          aria-labelledby="profile-tab-activity"
          className={`mt-6 ${activeTab === "activity" ? "block" : "hidden"}`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <ContributorRecentActivityCard profile={profile} />
            </div>
            <div className="lg:col-span-4">
              <ContributorStatsCard profile={profile} />
            </div>
          </div>
        </TabsContent>

        {/* ——— Tab 6: Reviews & Reputation ——— */}
        <TabsContent
          value="reviews"
          forceMount
          id="profile-panel-reviews"
          aria-labelledby="profile-tab-reviews"
          className={`mt-6 ${activeTab === "reviews" ? "block" : "hidden"}`}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <ContributorReputationStrip profile={profile} />
            </div>
            <div className="lg:col-span-5">
              <ContributorBadgesCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden About panel for static markup accessibility and crawlability */}
      <div className="sr-only" aria-hidden="true">
        <ContributorAboutPanel profile={profile} />
      </div>
    </div>
  );
}
