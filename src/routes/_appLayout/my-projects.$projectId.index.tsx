import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

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
import type { ProjectManualOverrideField } from "@/modules/projects";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

export const Route = createFileRoute("/_appLayout/my-projects/$projectId/")({
  head: () => ({ meta: [{ title: "إدارة المشروع | Sharek" }] }),
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
  const { projectId } = Route.useParams();
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
          {getProjectApiErrorMessage(projectQuery.error)}
        </p>
      </div>
    );
  }

  return (
    <OwnerProjectManagement projectId={projectId} project={projectQuery.data} />
  );
}

function OwnerProjectManagement({
  projectId,
  project,
}: {
  projectId: string;
  project: NonNullable<ReturnType<typeof useOwnerProjectQuery>["data"]>;
}) {
  const editMutation = useEditProjectMutation();
  const refreshMutation = useRefreshProjectSourceMutation();
  const publishMutation = usePublishProjectMutation();
  const archiveMutation = useArchiveProjectMutation();
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
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 md:px-6">
        <Link
          to={ROUTES.ownerContributionRequests(projectId)}
          className="inline-flex items-center gap-2 rounded-card border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
        >
          طلبات المساهمة لهذا المشروع
        </Link>
      </div>
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
            ? getProjectApiErrorMessage(editMutation.error)
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
            ? getProjectApiErrorMessage(refreshMutation.error)
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
            ? getProjectApiErrorMessage(publishMutation.error)
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
            ? getProjectApiErrorMessage(archiveMutation.error)
            : null
        }
        recoverySlot={showRecovery ? <RepositoryControlRecovery /> : null}
      />
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 md:px-6">
        <OwnerProposalWorkspace projectId={projectId} />
      </div>
    </>
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
