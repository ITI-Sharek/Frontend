import { ArrowRight, Github, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import {
  GitHubAppCandidatePicker,
  GitHubAppDisconnectConfirm,
  GitHubAppInstallationList,
  getGitHubAppApiErrorMessage,
  getGitHubAppErrorMessage,
  isRestartableCallbackError,
  resolveSelectedInstallationLinkId,
  useCompleteGitHubAppInstallationMutation,
  useDisconnectGitHubAppInstallationMutation,
  useGitHubAppConnectionAttemptQuery,
  useGitHubAppInstallationsQuery,
  useGitHubAppRepositoriesQuery,
  useStartGitHubAppInstallationMutation,
} from "@/modules/github-app";
import type {
  GitHubAppInstallationCandidateDto,
  GitHubAppInstallationLinkDto,
} from "@/modules/github-app";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export interface OwnerGithubSettingsSectionProps {
  attemptId?: string;
  callbackError?: string;
  onClearCallback?: () => void;
}

function getAutoSelectableCandidateId(
  candidates: GitHubAppInstallationCandidateDto[] | undefined,
): string | null {
  if (!candidates || candidates.length !== 1) return null;
  return candidates[0].providerInstallationId;
}

function findInstallation(
  installations: GitHubAppInstallationLinkDto[] | undefined,
  installationLinkId: string | null,
): GitHubAppInstallationLinkDto | null {
  if (!installations || !installationLinkId) return null;
  return (
    installations.find(
      (installation) => installation.installationLinkId === installationLinkId,
    ) ?? null
  );
}

/**
 * Settings -> GitHub for Project Owners.
 * Direct GitHub App installation management, repository listing, and account
 * connection directly in Settings without redirecting to a detached page.
 */
export function OwnerGithubSettingsSection({
  attemptId,
  callbackError,
  onClearCallback,
}: OwnerGithubSettingsSectionProps) {
  const { t } = useTranslation();
  const [selectedInstallationLinkId, setSelectedInstallationLinkId] = useState<
    string | null
  >(null);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [disconnectTarget, setDisconnectTarget] =
    useState<GitHubAppInstallationLinkDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const autoCompletedAttemptRef = useRef<string | null>(null);

  const isResolving = typeof attemptId === "string" && attemptId.length > 0;
  const isCallbackError =
    typeof callbackError === "string" && callbackError.length > 0;

  const installationsQuery = useGitHubAppInstallationsQuery();
  const attemptQuery = useGitHubAppConnectionAttemptQuery({
    attemptId: isResolving ? attemptId : "",
    enabled: isResolving,
  });
  const startInstallationMutation = useStartGitHubAppInstallationMutation();
  const completeInstallationMutation =
    useCompleteGitHubAppInstallationMutation();
  const disconnectMutation = useDisconnectGitHubAppInstallationMutation();

  const installations = installationsQuery.data ?? [];
  const selectedInstallation = findInstallation(
    installations,
    selectedInstallationLinkId,
  );
  const repositoriesQuery = useGitHubAppRepositoriesQuery({
    installationLinkId: selectedInstallation?.installationLinkId ?? "",
    page: repositoryPage,
    enabled: selectedInstallation !== null,
  });

  useEffect(() => {
    if (installationsQuery.data === undefined) return;
    setSelectedInstallationLinkId((current) =>
      resolveSelectedInstallationLinkId(installationsQuery.data, current),
    );
  }, [installationsQuery.data]);

  function startConnection(installationLinkId?: string) {
    setActionError(null);
    startInstallationMutation.mutate(
      installationLinkId
        ? {
            flowType: "authorize_existing_installation",
            installationLinkId,
          }
        : { flowType: "install_and_authorize" },
      {
        onSuccess: (connection) =>
          window.location.assign(connection.installationUrl),
        onError: (error) => setActionError(getGitHubAppApiErrorMessage(error)),
      },
    );
  }

  function completeAttempt(attId: string, providerInstallationId: string) {
    setActionError(null);
    completeInstallationMutation.mutate(
      { attemptId: attId, providerInstallationId },
      {
        onSuccess: (installation) => {
          setSelectedInstallationLinkId(installation.installationLinkId);
          setRepositoryPage(1);
          void installationsQuery.refetch();
          onClearCallback?.();
        },
        onError: (error) => setActionError(getGitHubAppApiErrorMessage(error)),
      },
    );
  }

  useEffect(() => {
    const attempt = attemptQuery.data;
    if (!attempt || autoCompletedAttemptRef.current === attempt.attemptId)
      return;
    const providerInstallationId = getAutoSelectableCandidateId(
      attempt.candidates,
    );
    if (!providerInstallationId) return;
    autoCompletedAttemptRef.current = attempt.attemptId;
    completeAttempt(attempt.attemptId, providerInstallationId);
  }, [attemptQuery.data]);

  function confirmDisconnect() {
    if (!disconnectTarget) return;
    disconnectMutation.mutate(disconnectTarget.installationLinkId, {
      onSuccess: () => {
        setDisconnectTarget(null);
        setRepositoryPage(1);
        void installationsQuery.refetch();
      },
      onError: (error) => setActionError(getGitHubAppApiErrorMessage(error)),
    });
  }

  const isConnecting =
    startInstallationMutation.isPending ||
    completeInstallationMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 rounded-input border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Github className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">
              {t("project.ownerGithub.title", "Link & Manage GitHub")}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t(
                "project.ownerGithub.description",
                "Connect the Sharek GitHub App to import repositories as projects.",
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isConnecting}
            onClick={() => startConnection()}
          >
            {isConnecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Github className="size-4" />
            )}
            <span>{t("project.ownerGithub.connect", "Connect GitHub")}</span>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={ROUTES.newProject}>
              <ArrowRight className="size-4 rtl:rotate-180" />
              <span>{t("project.import.title", "Import a project")}</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Callback Error State */}
      {isCallbackError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <p role="alert" className="text-sm text-destructive">
            {getGitHubAppErrorMessage(callbackError)}
          </p>
          {isRestartableCallbackError(callbackError) && (
            <Button
              type="button"
              size="sm"
              className="mt-3 gap-1.5"
              disabled={isConnecting}
              onClick={() => {
                onClearCallback?.();
                startConnection();
              }}
            >
              <RefreshCw className="size-4" />
              <span>{t("githubSkillPage.restart", "Try Again")}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Callback Resolving State */}
      {isResolving && (
        <Card>
          {attemptQuery.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>{t("githubSkillPage.completing", "Completing GitHub App connection...")}</span>
            </div>
          )}
          {attemptQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getGitHubAppApiErrorMessage(attemptQuery.error)}
            </p>
          )}
          {attemptQuery.data &&
            getAutoSelectableCandidateId(attemptQuery.data.candidates) ===
              null && (
              <GitHubAppCandidatePicker
                candidates={attemptQuery.data.candidates}
                isSubmitting={completeInstallationMutation.isPending}
                errorMessage={actionError}
                onSelect={(providerInstallationId) =>
                  completeAttempt(
                    attemptQuery.data.attemptId,
                    providerInstallationId,
                  )
                }
                onRestart={() => {
                  onClearCallback?.();
                  startConnection();
                }}
              />
            )}
        </Card>
      )}

      {/* Installations List */}
      <div className="flex flex-col gap-3 rounded-input border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">
            {t("githubSkillPage.installations", "Connected Installations")}
          </h3>
          {installations.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isConnecting}
              onClick={() => startConnection()}
              className="h-8 gap-1.5 text-xs"
            >
              <Github className="size-3.5" />
              <span>{t("project.ownerGithub.connect", "Connect GitHub")}</span>
            </Button>
          )}
        </div>

        {installationsQuery.isPending && (
          <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>{t("githubSkillPage.loadingInstallations", "Loading installations...")}</span>
          </div>
        )}

        {installationsQuery.isError && (
          <p role="alert" className="text-xs text-destructive">
            {getGitHubAppApiErrorMessage(installationsQuery.error)}
          </p>
        )}

        {installationsQuery.isSuccess && installations.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(
                "project.ownerGithub.empty",
                "Link the Sharek app on GitHub to make your selected repositories available for project import.",
              )}
            </p>
          </div>
        )}

        {installations.length > 0 && (
          <div className="mt-1">
            <GitHubAppInstallationList
              installations={installations}
              selectedInstallationLinkId={selectedInstallationLinkId}
              busyInstallationLinkId={
                disconnectMutation.isPending
                  ? disconnectTarget?.installationLinkId ?? null
                  : null
              }
              onSelect={(installationLinkId) => {
                setSelectedInstallationLinkId(installationLinkId);
                setRepositoryPage(1);
              }}
              onReauthorize={startConnection}
              onDisconnect={setDisconnectTarget}
            />
          </div>
        )}
      </div>

      {/* Disconnect Target Confirmation Modal */}
      {disconnectTarget && (
        <GitHubAppDisconnectConfirm
          installation={disconnectTarget}
          isSubmitting={disconnectMutation.isPending}
          errorMessage={
            disconnectMutation.isError
              ? getGitHubAppApiErrorMessage(disconnectMutation.error)
              : null
          }
          onCancel={() => setDisconnectTarget(null)}
          onConfirm={confirmDisconnect}
        />
      )}

      {/* Available Repositories for Selected Installation */}
      {selectedInstallation && (
        <div className="flex flex-col gap-3 rounded-input border border-border p-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {t(
                "project.ownerGithub.availableRepositories",
                "Available repositories",
              )}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t(
                "project.ownerGithub.availableRepositoriesDescription",
                "Only repositories selected during GitHub App installation are shown here and offered during project import.",
              )}
            </p>
          </div>

          {repositoriesQuery.isPending && (
            <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span>{t("githubApp.repositories.loading", "Loading repositories...")}</span>
            </div>
          )}

          {repositoriesQuery.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getGitHubAppApiErrorMessage(repositoriesQuery.error)}
            </p>
          )}

          {repositoriesQuery.data && repositoriesQuery.data.items.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {repositoriesQuery.data.items.map((repository) => (
                <div
                  key={repository.repositoryId}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-fog p-2.5"
                >
                  <span
                    dir="ltr"
                    className="truncate font-mono text-xs font-semibold text-foreground"
                  >
                    {repository.fullName}
                  </span>
                  <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                    <a href={ROUTES.newProject}>
                      {t("project.import.title", "Import")}
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
