import { Link, createFileRoute } from "@tanstack/react-router";
import { FileText, FolderOpen, NotebookPen, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import i18n from "@/lib/i18n";
import {
  GitHubAppDisconnectConfirm,
  GitHubAppInstallationList,
  getGitHubAppApiErrorMessage,
  useDisconnectGitHubAppInstallationMutation,
  useGitHubAppInstallationsQuery,
  useStartGitHubAppInstallationMutation,
} from "@/modules/github-app";
import type { GitHubAppInstallationLinkDto } from "@/modules/github-app";
import {
  ProjectOwnerDetailView,
  getProjectApiErrorMessage,
  getRestoreFieldIdempotencyKey,
  sourceNeedsRepositoryControlRecovery,
  useArchiveProjectMutation,
  useEditProjectMutation,
  useOwnerProjectQuery,
  usePublishProjectMutation,
  useRefreshProjectSourceMutation,
} from "@/modules/projects";
import { OwnerProposalWorkspace } from "@/modules/contribution-proposals";
import { useOwnerProjectContributionRequestsQuery } from "@/modules/contribution-requests";
import {
  MaterialAnalysisPanel,
  MaterialsPanel,
  useProjectMaterialsQuery,
} from "@/modules/materials";
import type { ProjectManualOverrideField } from "@/modules/projects";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";
import { cn } from "@/lib/utils";

type ProjectWorkspaceTab = "overview" | "materials" | "analysis" | "proposals";

function validateSearch(search: Record<string, unknown>): {
  tab: ProjectWorkspaceTab;
} {
  const tab = search.tab;
  return {
    tab:
      tab === "materials" || tab === "analysis" || tab === "proposals"
        ? tab
        : "overview",
  };
}

export const Route = createFileRoute("/_appLayout/my-projects/$projectId/")({
  head: () => ({ meta: [{ title: i18n.t("pageTitle.projectManagement") }] }),
  validateSearch,
  component: OwnerProjectManagementPage,
});

/** Stable per-(operation, revision) idempotency key so repeated clicks after
 * a failure replay the same attempt instead of minting a new one each time. */
function useProjectActionKey(operation: string, revision: number) {
  const ref = useRef<{ token: string; key: string } | null>(null);
  const token = `${operation}:${revision}`;
  if (ref.current === null || ref.current.token !== token) {
    ref.current = { token, key: createIdempotencyKey() };
  }
  return ref.current.key;
}

function OwnerProjectManagementPage() {
  const { t } = useTranslation();
  const { projectId } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const projectQuery = useOwnerProjectQuery(projectId);

  if (projectQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل المشروع...</p>
      </div>
    );
  }

  if (projectQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm leading-6 text-destructive">
          {getProjectApiErrorMessage(t, projectQuery.error)}
        </p>
      </div>
    );
  }

  return (
    <OwnerProjectManagement
      projectId={projectId}
      project={projectQuery.data}
      activeTab={tab}
      onTabChange={(nextTab) =>
        void navigate({ search: { tab: nextTab }, replace: true })
      }
    />
  );
}

function OwnerProjectManagement({
  projectId,
  project,
  activeTab,
  onTabChange,
}: {
  projectId: string;
  project: NonNullable<ReturnType<typeof useOwnerProjectQuery>["data"]>;
  activeTab: ProjectWorkspaceTab;
  onTabChange: (tab: ProjectWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
  const editMutation = useEditProjectMutation();
  const refreshMutation = useRefreshProjectSourceMutation();
  const publishMutation = usePublishProjectMutation();
  const archiveMutation = useArchiveProjectMutation();
  const contributionRequestsQuery =
    useOwnerProjectContributionRequestsQuery(projectId);
  const [restoringField, setRestoringField] =
    useState<ProjectManualOverrideField | null>(null);

  const editKey = useProjectActionKey("edit", project.revision);
  const refreshKey = useProjectActionKey("refresh", project.revision);
  const publishKey = useProjectActionKey("publish", project.revision);
  const archiveKey = useProjectActionKey("archive", project.revision);
  const restoreKeysRef = useRef(new Map<string, string>());

  const showRecovery = sourceNeedsRepositoryControlRecovery(
    project.source.status,
  );

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6">
        <nav
          aria-label={t("project.owner.workspaceTabsAria")}
          className="flex gap-1 overflow-x-auto border-b border-border"
        >
          <ProjectTabButton
            icon={FileText}
            label={t("project.owner.overviewTab")}
            selected={activeTab === "overview"}
            onClick={() => onTabChange("overview")}
          />
          <ProjectTabButton
            icon={FolderOpen}
            label={t("project.owner.materialsTab")}
            selected={activeTab === "materials"}
            onClick={() => onTabChange("materials")}
          />
          <ProjectTabButton
            icon={Sparkles}
            label={t("project.owner.analysisTab")}
            selected={activeTab === "analysis"}
            onClick={() => onTabChange("analysis")}
          />
          <ProjectTabButton
            icon={NotebookPen}
            label={t("project.owner.proposalsTab")}
            selected={activeTab === "proposals"}
            onClick={() => onTabChange("proposals")}
          />
          <Link
            to={ROUTES.ownerContributionRequests(projectId)}
            className="flex min-h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("project.owner.contributionRequestsLink")}
            <span
              aria-label={t("project.owner.contributionRequestsCount", {
                count: contributionRequestsQuery.data?.totalCount ?? 0,
              })}
              className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary"
            >
              {contributionRequestsQuery.data?.totalCount ?? "…"}
            </span>
          </Link>
        </nav>
      </div>
      {activeTab === "overview" && (
        <ProjectOwnerDetailView
          project={project}
          myProjectsHref="/my-projects"
          publicProjectHref={`/projects/${encodeURIComponent(project.slug)}`}
          onSaveEdit={(payload) => {
            editMutation.mutate({
              projectId,
              idempotencyKey: editKey,
              ...payload,
            });
          }}
          isSavingEdit={editMutation.isPending}
          editError={
            editMutation.isError
              ? getProjectApiErrorMessage(t, editMutation.error)
              : null
          }
          onRestoreField={(field) => {
            setRestoringField(field);
            editMutation.mutate(
              {
                projectId,
                idempotencyKey: getRestoreFieldIdempotencyKey(
                  restoreKeysRef.current,
                  project.revision,
                  field,
                ),
                expectedRevision: project.revision,
                restoreFromSource: [field],
              },
              { onSettled: () => setRestoringField(null) },
            );
          }}
          restoringField={restoringField}
          onRefresh={() => {
            refreshMutation.mutate({
              projectId,
              idempotencyKey: refreshKey,
              expectedRevision: project.revision,
            });
          }}
          isRefreshing={refreshMutation.isPending}
          refreshError={
            refreshMutation.isError
              ? getProjectApiErrorMessage(t, refreshMutation.error)
              : null
          }
          onPublish={() => {
            publishMutation.mutate({
              projectId,
              idempotencyKey: publishKey,
              expectedRevision: project.revision,
              confirm: true,
            });
          }}
          isPublishing={publishMutation.isPending}
          publishError={
            publishMutation.isError
              ? getProjectApiErrorMessage(t, publishMutation.error)
              : null
          }
          onArchive={() => {
            archiveMutation.mutate({
              projectId,
              idempotencyKey: archiveKey,
              expectedRevision: project.revision,
              confirm: true,
            });
          }}
          isArchiving={archiveMutation.isPending}
          archiveError={
            archiveMutation.isError
              ? getProjectApiErrorMessage(t, archiveMutation.error)
              : null
          }
          recoverySlot={showRecovery ? <RepositoryControlRecovery /> : null}
        />
      )}
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6 md:px-6">
        {/* Composed at the route, not inside modules/projects: a module must
            never import another module. */}
        {activeTab === "materials" && (
          <OwnerProjectMaterials projectId={projectId} />
        )}
        {activeTab === "analysis" && (
          <MaterialAnalysisPanel
            projectId={projectId}
            projectRevision={project.revision}
            projectStatus={project.status}
          />
        )}
        {activeTab === "proposals" && (
          <OwnerProposalWorkspace projectId={projectId} />
        )}
      </div>
    </>
  );
}

function ProjectTabButton({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm transition-colors",
        selected
          ? "border-primary font-semibold text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}

/**
 * Uploading remains storage consent only. Analysis has its own route-level
 * panel below so selecting source material is an explicit owner action.
 */
function OwnerProjectMaterials({ projectId }: { projectId: string }) {
  const materialsQuery = useProjectMaterialsQuery(projectId);
  return (
    <MaterialsPanel
      scope={{ kind: "project", id: projectId }}
      isOwner
      materials={materialsQuery.data}
      isLoading={materialsQuery.isPending}
      isError={materialsQuery.isError}
    />
  );
}

/**
 * Composes the `github-app` module's installation UI here at the route
 * level (not inside `modules/projects`, which must never import another
 * module) so an owner whose organization/shared repository control needs
 * verification can reconnect or re-select without leaving this page.
 */
function RepositoryControlRecovery() {
  const installationsQuery = useGitHubAppInstallationsQuery();
  const startMutation = useStartGitHubAppInstallationMutation();
  const disconnectMutation = useDisconnectGitHubAppInstallationMutation();
  const [disconnectTarget, setDisconnectTarget] =
    useState<GitHubAppInstallationLinkDto | null>(null);

  const installations = installationsQuery.data ?? [];

  function startConnection(installationLinkId?: string) {
    startMutation.mutate(
      installationLinkId
        ? { flowType: "authorize_existing_installation", installationLinkId }
        : { flowType: "install_and_authorize" },
      {
        onSuccess: (connection) => {
          window.location.assign(connection.installationUrl);
        },
      },
    );
  }

  return (
    <div className="mt-4 rounded-card border border-amber-500/30 bg-amber-500/5 p-4">
      <h3 className="text-sm font-bold text-foreground">
        يلزم التحقق من التحكم بالمستودع
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        مستودع منظمة أو مستودع مشترك يتطلب تثبيتاً نشطاً لتطبيق GitHub مع اختيار
        صريح لهذا المستودع. مستودع شخصي يتطلب أن تطابق هوية GitHub الموثقة مالك
        المستودع. أعد الربط أو الاختيار أدناه ثم حدّث بيانات المصدر.
      </p>

      {installationsQuery.isPending && (
        <p className="mt-3 text-xs text-muted-foreground">
          جارٍ تحميل روابط GitHub...
        </p>
      )}

      {installationsQuery.isError && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {getGitHubAppApiErrorMessage(installationsQuery.error)}
        </p>
      )}

      {installations.length > 0 && (
        <div className="mt-3">
          <GitHubAppInstallationList
            installations={installations}
            selectedInstallationLinkId={null}
            busyInstallationLinkId={
              disconnectMutation.isPending
                ? (disconnectTarget?.installationLinkId ?? null)
                : null
            }
            onSelect={() => {
              // Selection here is informational only; publish/refresh
              // revalidate control server-side against the saved selection.
            }}
            onReauthorize={(installationLinkId) =>
              startConnection(installationLinkId)
            }
            onDisconnect={setDisconnectTarget}
          />
        </div>
      )}

      {disconnectTarget && (
        <div className="mt-3">
          <GitHubAppDisconnectConfirm
            installation={disconnectTarget}
            isSubmitting={disconnectMutation.isPending}
            errorMessage={
              disconnectMutation.isError
                ? getGitHubAppApiErrorMessage(disconnectMutation.error)
                : null
            }
            onCancel={() => setDisconnectTarget(null)}
            onConfirm={() => {
              disconnectMutation.mutate(disconnectTarget.installationLinkId, {
                onSuccess: () => setDisconnectTarget(null),
              });
            }}
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={startMutation.isPending}
          onClick={() => startConnection()}
        >
          ربط حساب أو منظمة
        </Button>
        <Link
          to="/profile/github"
          className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          إدارة كل روابط GitHub
        </Link>
      </div>

      {startMutation.isError && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {getGitHubAppApiErrorMessage(startMutation.error)}
        </p>
      )}
    </div>
  );
}
