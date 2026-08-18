import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useCurrentUserQuery } from "@/modules/auth";
import { useContributionRequestsQuery } from "@/modules/contribution-requests";
import { usePublicProjectApplicantsQuery } from "../api/queries/use-public-project-applicants-query";
import { usePublicProjectSavedStateQuery } from "../api/queries/use-public-project-saved-state-query";
import { useSetPublicProjectSavedMutation } from "../api/mutations/use-set-public-project-saved-mutation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

import { PublicProjectHero } from "./public-project-hero";
import { PublicProjectOverviewTab } from "./public-project-overview-tab";
import { PublicProjectTasksTab } from "./public-project-tasks-tab";
import { PublicProjectFilesTab } from "./public-project-files-tab";
import { PublicProjectApplicantsTab } from "./public-project-applicants-tab";
import { PublicProjectActivityTab } from "./public-project-activity-tab";
import { PublicProjectDiscussionsTab } from "./public-project-discussions-tab";
import { PublicProjectSidebar } from "./public-project-sidebar";
import {
  ApplyProjectDialog,
  ShareProjectDialog,
  TaskDetailDialog,
} from "./public-project-modals";
import type { TaskItemData } from "./public-project-modals";
import type { PublicProjectDetailDto } from "../types/public-project.types";

export interface PublicProjectDetailViewProps {
  project: PublicProjectDetailDto;
  exploreHref: string;
  proposalAction?: ReactNode;
  materialsSlot?: ReactNode;
  canSave?: boolean;
  isOwner?: boolean;
  currentUserRole?: "owner" | "contributor" | "admin";
}

export function PublicProjectDetailView({
  project,
  exploreHref,
  proposalAction,
  materialsSlot,
  canSave = false,
  isOwner: propIsOwner,
  currentUserRole: propCurrentUserRole,
}: PublicProjectDetailViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modal dialog states
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItemData | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const contributionRequestsQuery = useContributionRequestsQuery();
  const applicantsQuery = usePublicProjectApplicantsQuery(project.slug);
  const savedStateQuery = usePublicProjectSavedStateQuery(project.slug, canSave);
  const setSaved = useSetPublicProjectSavedMutation(project.slug);
  const applicants = applicantsQuery.data?.items ?? [];
  const tasks: TaskItemData[] = (contributionRequestsQuery.data?.items ?? [])
    .filter((request) => request.projectId === project.id)
    .map((request) => ({
      id: request.id,
      title: request.title,
      tags: request.technologyTags,
      difficulty: request.difficulty ?? "beginner",
      dueDate:
        request.targetCompletionDate ??
        request.applicationsCloseAt ??
        t("common.notAvailable", "Not available"),
      reward: request.reward
        ? `${request.reward.amount} ${request.reward.currency}`
        : t("project.detail.noReward", "No reward"),
      status: "open",
    }));

  const handleViewTask = (task: TaskItemData) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleApplyToTask = (task: TaskItemData) => {
    setSelectedTask(task);
    setApplyDialogOpen(true);
  };

  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;
  const resolvedRole = propCurrentUserRole ?? currentUser?.role;
  const isOwner =
    propIsOwner ??
    (resolvedRole === "owner" &&
      (!project.owner?.username || currentUser?.username === project.owner.username));

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ── 1. Top Breadcrumb & Hero Header Section ── */}
      <PublicProjectHero
        project={project}
        exploreHref={exploreHref}
        onApplyClick={() => {
          setSelectedTask(null);
          setApplyDialogOpen(true);
        }}
        onShareClick={() => setShareDialogOpen(true)}
        onSaveClick={() => setSaved.mutate(!(savedStateQuery.data?.saved ?? false))}
        canSave={canSave}
        isSaved={savedStateQuery.data?.saved ?? false}
        isSavePending={setSaved.isPending || savedStateQuery.isPending}
        proposalAction={proposalAction}
        isOwner={isOwner}
        currentUserRole={resolvedRole}
      />

      {/* ── 2. Tabbed Content & Sidebars ── */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        {/* Navigation Tabs Bar */}
        <div className="border-b border-border/80 pb-px">
          <TabsList
            variant="line"
            className="flex w-full justify-start gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
          >
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.overview", "Overview")}
            </TabsTrigger>

            <TabsTrigger
              value="tasks"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.tasks", "Tasks")} ({tasks.length})
            </TabsTrigger>

            <TabsTrigger
              value="files"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.files", "Files")}
            </TabsTrigger>

            <TabsTrigger
              value="applicants"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.applicants", "Applicants")} ({applicants.length})
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.activity", "Activity")}
            </TabsTrigger>

            <TabsTrigger
              value="discussions"
              className="text-xs sm:text-sm font-semibold pb-3 data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary"
            >
              {t("project.detail.tabs.discussions", "Discussions")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── 3. Tab Contents Layout ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Left Column (2/3 width) */}
          <div className="min-w-0 lg:col-span-2">
            <TabsContent value="overview" className="mt-0 outline-none">
              <PublicProjectOverviewTab
                project={project}
                tasks={tasks}
                onViewTask={handleViewTask}
                materialsSlot={materialsSlot}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 outline-none">
              <PublicProjectTasksTab
                tasks={tasks}
                onViewTask={handleViewTask}
                onApplyToTask={handleApplyToTask}
                isOwner={isOwner}
                currentUserRole={resolvedRole}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-0 outline-none">
              <PublicProjectFilesTab project={project} />
            </TabsContent>

            <TabsContent value="applicants" className="mt-0 outline-none">
              <PublicProjectApplicantsTab
                applicants={applicants}
                isLoading={applicantsQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0 outline-none">
              <PublicProjectActivityTab project={project} />
            </TabsContent>

            <TabsContent value="discussions" className="mt-0 outline-none">
              <PublicProjectDiscussionsTab />
            </TabsContent>
          </div>

          {/* Right Sidebar Widgets Column (1/3 width) */}
          <div className="min-w-0 lg:col-span-1">
            <PublicProjectSidebar
              project={project}
            />
          </div>
        </div>
      </Tabs>

      {/* ── 4. Interactive Modals ── */}
      <ApplyProjectDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        project={project}
        tasks={tasks}
        initialTask={selectedTask}
      />

      <TaskDetailDialog
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        task={selectedTask}
        onApply={handleApplyToTask}
      />

      <ShareProjectDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        project={project}
      />
    </div>
  );
}
