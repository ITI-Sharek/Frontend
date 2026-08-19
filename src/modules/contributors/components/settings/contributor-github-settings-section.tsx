import { Github, Loader2, RefreshCw, Sparkles, Unlink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import {
  GitHubAppCandidatePicker,
  GitHubAppDisconnectConfirm,
  GitHubAppInstallationList,
  GitHubAppRepositoryPicker,
  getGitHubAppApiErrorMessage,
  getGitHubAppErrorMessage,
  isRestartableCallbackError,
  resolveSelectedInstallationLinkId,
  toggleRepositorySelection,
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

import {
  MAX_ANALYSIS_REPOSITORIES,
  MIN_ANALYSIS_REPOSITORIES,
  SKILL_ANALYSIS_CONSENT_VERSION,
  SkillAnalysisConsent,
  SkillGenerationStatusPanel,
  getActiveGenerationIdFromError,
  getSkillProfileApiErrorMessage,
  isGenerationActive,
  useLatestSkillProfileGenerationQuery,
  useRetrySkillProfileGenerationMutation,
  useSkillProfileGenerationQuery,
  useStartSkillProfileGenerationMutation,
} from "@/modules/skill-profiles";

import type { ContributorProfileDto } from "../../types/contributor-profile.types";

export interface ContributorGithubSettingsSectionProps {
  profile: ContributorProfileDto;
  attemptId?: string;
  callbackError?: string;
  onClearCallback?: () => void;
  onConnectGitHub: () => Promise<void>;
  onDisconnectGitHub: () => Promise<void>;
  onOpenRepositories?: () => void;
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

function buildConsent() {
  return { accepted: true, version: SKILL_ANALYSIS_CONSENT_VERSION };
}

function buildStartGenerationPayload(
  installationLinkId: string,
  repositoryIds: string[],
) {
  return {
    installationLinkId,
    repositoryIds,
    consent: buildConsent(),
  };
}

function canStartGeneration({
  installationLinkId,
  selectedRepositoryIds,
  consentAccepted,
  isSubmitting,
  hasActiveGeneration,
}: {
  installationLinkId: string | null;
  selectedRepositoryIds: string[];
  consentAccepted: boolean;
  isSubmitting: boolean;
  hasActiveGeneration: boolean;
}): boolean {
  return (
    installationLinkId !== null &&
    consentAccepted &&
    !isSubmitting &&
    !hasActiveGeneration &&
    selectedRepositoryIds.length >= MIN_ANALYSIS_REPOSITORIES &&
    selectedRepositoryIds.length <= MAX_ANALYSIS_REPOSITORIES
  );
}

/**
 * Settings → "GitHub" for Contributors. Two concerns live here:
 * 1. GitHub *identity* (social login) — `profile.githubStatus`.
 * 2. GitHub App *repository* access & AI skill analysis.
 * Neither gates the other, and disconnecting one never touches the other.
 */
export function ContributorGithubSettingsSection({
  profile,
  attemptId,
  callbackError,
  onClearCallback,
  onConnectGitHub,
  onDisconnectGitHub,
}: ContributorGithubSettingsSectionProps) {
  const { t } = useTranslation();

  const [selectedInstallationLinkId, setSelectedInstallationLinkId] = useState<
    string | null
  >(null);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<string[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [retryConsentAccepted, setRetryConsentAccepted] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
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
  const latestGenerationQuery = useLatestSkillProfileGenerationQuery();
  const generationQuery = useSkillProfileGenerationQuery({
    generationId: activeGenerationId ?? "",
    enabled: activeGenerationId !== null,
  });

  const startInstallationMutation = useStartGitHubAppInstallationMutation();
  const completeInstallationMutation =
    useCompleteGitHubAppInstallationMutation();
  const disconnectMutation = useDisconnectGitHubAppInstallationMutation();
  const startGenerationMutation = useStartSkillProfileGenerationMutation();
  const retryGenerationMutation = useRetrySkillProfileGenerationMutation();

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

  useEffect(() => {
    const latest = latestGenerationQuery.data;
    if (!latest) return;
    setActiveGenerationId((current) => current ?? latest.generationId);
  }, [latestGenerationQuery.data]);

  function completeAttempt(attId: string, providerInstallationId: string) {
    setActionError(null);
    completeInstallationMutation.mutate(
      { attemptId: attId, providerInstallationId },
      {
        onSuccess: (installation) => {
          setSelectedInstallationLinkId(installation.installationLinkId);
          setSelectedRepositoryIds([]);
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

  function handleSelectInstallation(installationLinkId: string) {
    setSelectedInstallationLinkId(installationLinkId);
    setSelectedRepositoryIds([]);
    setRepositoryPage(1);
    setConsentAccepted(false);
  }

  function handleToggleRepository(repositoryId: string) {
    setSelectedRepositoryIds((current) =>
      toggleRepositorySelection(
        current,
        repositoryId,
        MAX_ANALYSIS_REPOSITORIES,
      ),
    );
  }

  function handleStartGeneration() {
    if (!selectedInstallation) return;
    setActionError(null);
    startGenerationMutation.mutate(
      buildStartGenerationPayload(
        selectedInstallation.installationLinkId,
        selectedRepositoryIds,
      ),
      {
        onSuccess: (generation) => {
          setActiveGenerationId(generation.generationId);
          setConsentAccepted(false);
        },
        onError: (error) => {
          const runningGenerationId = getActiveGenerationIdFromError(error);
          if (runningGenerationId) {
            setActiveGenerationId(runningGenerationId);
            setConsentAccepted(false);
            return;
          }
          setActionError(getSkillProfileApiErrorMessage(t, error));
        },
      },
    );
  }

  function handleRetryGeneration() {
    const generation = generationQuery.data;
    if (!generation || !retryConsentAccepted) return;
    setActionError(null);
    retryGenerationMutation.mutate(
      { generationId: generation.generationId, consent: buildConsent() },
      {
        onSuccess: (next) => {
          setActiveGenerationId(next.generationId);
          setRetryConsentAccepted(false);
        },
        onError: (error) => {
          const runningGenerationId = getActiveGenerationIdFromError(error);
          if (runningGenerationId) {
            setActiveGenerationId(runningGenerationId);
            setRetryConsentAccepted(false);
            return;
          }
          setActionError(getSkillProfileApiErrorMessage(t, error));
        },
      },
    );
  }

  function confirmDisconnect() {
    if (!disconnectTarget) return;
    setActionError(null);
    disconnectMutation.mutate(disconnectTarget.installationLinkId, {
      onSuccess: () => {
        setDisconnectTarget(null);
        setSelectedRepositoryIds([]);
        setRepositoryPage(1);
        void installationsQuery.refetch();
      },
      onError: (error) => setActionError(getGitHubAppApiErrorMessage(error)),
    });
  }

  const currentGeneration = generationQuery.data ?? latestGenerationQuery.data ?? null;
  const hasActiveGeneration =
    currentGeneration !== null && isGenerationActive(currentGeneration.status);
  const isConnecting =
    startInstallationMutation.isPending ||
    completeInstallationMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. GitHub Account Social Login */}
      <div className="flex items-center justify-between gap-4 rounded-input border border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Github className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {profile.githubStatus.connected
                ? t("contributor.githubStatus.connected")
                : t("contributor.githubStatus.disconnected")}
            </p>
            {profile.githubStatus.connected && profile.githubStatus.username ? (
              <a
                dir="ltr"
                href={`https://github.com/${profile.githubStatus.username}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[13px] tracking-[0.65px] text-primary hover:opacity-80"
              >
                @{profile.githubStatus.username}
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("contributor.settings.githubConnectHint")}
              </p>
            )}
          </div>
        </div>
        {profile.githubStatus.connected ? (
          <div className="flex flex-wrap justify-end gap-2">
            <GitHubConnectButton
              label={t("contributor.settings.githubChangeAccount")}
              onConnectGitHub={onConnectGitHub}
            />
            <GitHubDisconnectButton onDisconnectGitHub={onDisconnectGitHub} />
          </div>
        ) : (
          <GitHubConnectButton
            label={t("contributor.settings.githubConnectAccount")}
            onConnectGitHub={onConnectGitHub}
          />
        )}
      </div>

      {/* 2. AI Skill Analysis Header */}
      <div className="flex flex-col gap-4 rounded-input border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">
                {t("contributor.settings.aiSkillsAnalysisTitle", "AI skill analysis")}
              </h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                {t("common.optional", "Optional")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t(
                "contributor.settings.aiSkillsAnalysisDescription",
                "Analyze repositories from your GitHub account or organizations to verify and highlight your skills.",
              )}
            </p>
          </div>
        </div>
        {installations.length === 0 && (
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
            <span>{t("contributor.settings.githubReposButton", "Connect GitHub App")}</span>
          </Button>
        )}
      </div>

      {/* Callback Error State */}
      {isCallbackError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <p role="alert" className="text-sm text-destructive">
            {getGitHubAppErrorMessage(callbackError)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isRestartableCallbackError(callbackError) && (
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClearCallback}
            >
              <span>{t("githubSkillPage.dismiss", "Dismiss")}</span>
            </Button>
          </div>
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
            <div className="flex flex-col items-start gap-3">
              <p role="alert" className="text-sm text-destructive">
                {getGitHubAppApiErrorMessage(attemptQuery.error)}
              </p>
              <Button
                type="button"
                size="sm"
                disabled={isConnecting}
                onClick={() => {
                  onClearCallback?.();
                  startConnection();
                }}
              >
                <RefreshCw className="size-4" />
                <span>{t("githubSkillPage.restart", "Try Again")}</span>
              </Button>
            </div>
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

      {/* Latest / Active Generation Status Panel */}
      {currentGeneration && (
        <SkillGenerationStatusPanel
          generation={currentGeneration}
          onRetry={handleRetryGeneration}
          isRetrying={retryGenerationMutation.isPending}
          errorMessage={
            retryGenerationMutation.isError
              ? getSkillProfileApiErrorMessage(t, retryGenerationMutation.error)
              : null
          }
          retryDisabled={!retryConsentAccepted}
          retryConsentSlot={
            <SkillAnalysisConsent
              id="retry-skill-analysis-consent"
              accepted={retryConsentAccepted}
              onChange={setRetryConsentAccepted}
            />
          }
        />
      )}

      {/* Connected Installations List */}
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
              <span>{t("githubSkillPage.connectAccount", "Connect repositories")}</span>
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
          <div className="py-4 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(
                "githubSkillPage.emptyInstallations",
                "There are no links yet. Connect repositories from your GitHub account or organizations to analyze your skills.",
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
              onSelect={handleSelectInstallation}
              onReauthorize={(installationLinkId) =>
                startConnection(installationLinkId)
              }
              onDisconnect={setDisconnectTarget}
            />
          </div>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
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

      {/* Repository Picker & Start Generation */}
      {selectedInstallation && (
        <div className="flex flex-col gap-4">
          <GitHubAppRepositoryPicker
            page={repositoriesQuery.data}
            isLoading={repositoriesQuery.isPending}
            errorMessage={
              repositoriesQuery.isError
                ? getGitHubAppApiErrorMessage(repositoriesQuery.error)
                : null
            }
            selectedRepositoryIds={selectedRepositoryIds}
            maxSelected={MAX_ANALYSIS_REPOSITORIES}
            onToggle={handleToggleRepository}
            currentPage={repositoryPage}
            onPageChange={setRepositoryPage}
            disabled={hasActiveGeneration}
          />

          <div className="flex flex-col gap-4 rounded-input border border-border p-4">
            <SkillAnalysisConsent
              accepted={consentAccepted}
              disabled={hasActiveGeneration}
              onChange={setConsentAccepted}
            />

            {actionError && (
              <p role="alert" className="text-xs text-destructive">
                {actionError}
              </p>
            )}

            <div>
              <Button
                type="button"
                size="sm"
                onClick={handleStartGeneration}
                disabled={
                  !canStartGeneration({
                    installationLinkId: selectedInstallation.installationLinkId,
                    selectedRepositoryIds,
                    consentAccepted,
                    isSubmitting: startGenerationMutation.isPending,
                    hasActiveGeneration,
                  })
                }
              >
                {startGenerationMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("githubSkillPage.starting", "Starting...")}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>{t("githubSkillPage.start", "Start skill analysis")}</span>
                  </>
                )}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {t(
                  "githubSkillPage.startHelp",
                  "No analysis request is sent until you press this button.",
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GitHubConnectButton({
  label,
  onConnectGitHub,
}: {
  label: string;
  onConnectGitHub: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);
    setIsStarting(true);
    try {
      await onConnectGitHub();
    } catch (connectError) {
      setIsStarting(false);
      setError(
        getApiErrorMessage(connectError, t("contributor.settings.githubConnectError")),
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" size="sm" disabled={isStarting} onClick={handleConnect}>
        {isStarting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{t("contributor.settings.redirecting")}</span>
          </>
        ) : (
          <>
            <Github className="size-4" />
            <span>{label}</span>
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GitHubDisconnectButton({
  onDisconnectGitHub,
}: {
  onDisconnectGitHub: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDisconnect() {
    if (!window.confirm(t("contributor.settings.disconnectConfirm"))) {
      return;
    }

    setError(null);
    setIsDisconnecting(true);
    try {
      await onDisconnectGitHub();
    } catch (disconnectError) {
      setIsDisconnecting(false);
      setError(
        getApiErrorMessage(disconnectError, t("contributor.settings.disconnectError")),
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isDisconnecting}
        onClick={handleDisconnect}
      >
        {isDisconnecting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Unlink className="size-4" />
        )}
        <span>
          {isDisconnecting
            ? t("contributor.settings.disconnecting")
            : t("contributor.settings.disconnectAccount")}
        </span>
      </Button>
      {error && <p className="max-w-xs text-xs text-destructive">{error}</p>}
    </div>
  );
}
