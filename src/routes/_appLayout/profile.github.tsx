import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Github, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import {
  GitHubAppCandidatePicker,
  GitHubAppDisconnectConfirm,
  GitHubAppInstallationList,
  GitHubAppRepositoryPicker,
  getGitHubAppApiErrorMessage,
  getGitHubAppErrorMessage,
  resolveSelectedInstallationLinkId,
  toggleRepositorySelection,
  useCompleteGitHubAppInstallationMutation,
  useDisconnectGitHubAppInstallationMutation,
  useGitHubAppConnectionAttemptQuery,
  useGitHubAppInstallationsQuery,
  useGitHubAppRepositoriesQuery,
  useStartGitHubAppInstallationMutation,
} from "@/modules/github-app";
import type { GitHubAppInstallationLinkDto } from "@/modules/github-app";
import {
  MAX_ANALYSIS_REPOSITORIES,
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
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import {
  buildConsent,
  buildStartGenerationPayload,
  canStartGeneration,
  findInstallation,
  getAutoSelectableCandidateId,
  getCallbackPhase,
  validateGithubSkillAnalysisSearch,
} from "./profile.github.helpers";

export const GITHUB_SKILL_ANALYSIS_PATH = "/profile/github";

export const Route = createFileRoute("/_appLayout/profile/github")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: validateGithubSkillAnalysisSearch,
  component: GithubSkillAnalysisPage,
});

/**
 * Composes the GitHub App installation module with the skill-profiles module.
 * Cross-feature wiring lives here, in the route, so neither module imports the
 * other. Nothing on this page starts an analysis implicitly: connecting,
 * selecting an installation, and browsing repositories are all read-only until
 * the contributor consents and presses Start.
 */
function GithubSkillAnalysisPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const callbackPhase = getCallbackPhase(search);

  const [selectedInstallationLinkId, setSelectedInstallationLinkId] = useState<
    string | null
  >(null);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<string[]>(
    [],
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [retryConsentAccepted, setRetryConsentAccepted] = useState(false);
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(
    null,
  );
  const [disconnectTarget, setDisconnectTarget] =
    useState<GitHubAppInstallationLinkDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const installationsQuery = useGitHubAppInstallationsQuery();
  const attemptQuery = useGitHubAppConnectionAttemptQuery({
    attemptId: callbackPhase.kind === "resolving" ? callbackPhase.attemptId : "",
    enabled: callbackPhase.kind === "resolving",
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

  // Keep the picker pointed at a usable installation as links appear/change.
  useEffect(() => {
    if (installationsQuery.data === undefined) return;
    setSelectedInstallationLinkId((current) =>
      resolveSelectedInstallationLinkId(installationsQuery.data, current),
    );
  }, [installationsQuery.data]);

  // Reload recovery: restore the newest generation and resume polling.
  useEffect(() => {
    const latest = latestGenerationQuery.data;
    if (!latest) return;
    setActiveGenerationId((current) => current ?? latest.generationId);
  }, [latestGenerationQuery.data]);

  // Exactly one candidate continues without asking; more than one gets a picker.
  const autoCompletedAttemptRef = useRef<string | null>(null);
  useEffect(() => {
    const attempt = attemptQuery.data;
    if (!attempt) return;
    if (autoCompletedAttemptRef.current === attempt.attemptId) return;
    const providerInstallationId = getAutoSelectableCandidateId(
      attempt.candidates,
    );
    if (!providerInstallationId) return;
    autoCompletedAttemptRef.current = attempt.attemptId;
    // Guarded by the ref above so the single-use attempt is never replayed.
    completeAttempt(attempt.attemptId, providerInstallationId);
  }, [attemptQuery.data]);

  function clearCallbackSearch() {
    void navigate({ to: GITHUB_SKILL_ANALYSIS_PATH, search: {}, replace: true });
  }

  function completeAttempt(attemptId: string, providerInstallationId: string) {
    setActionError(null);
    completeInstallationMutation.mutate(
      { attemptId, providerInstallationId },
      {
        onSuccess: (installation) => {
          setSelectedInstallationLinkId(installation.installationLinkId);
          setSelectedRepositoryIds([]);
          setRepositoryPage(1);
          void installationsQuery.refetch();
          clearCallbackSearch();
        },
        onError: (error) => {
          setActionError(getGitHubAppApiErrorMessage(error));
        },
      },
    );
  }

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
        // The provider URL is always server-issued; never constructed here.
        onSuccess: (connection) => {
          window.location.assign(connection.installationUrl);
        },
        onError: (error) => {
          setActionError(getGitHubAppApiErrorMessage(error));
        },
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
          // A duplicate start resumes the already-active generation.
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

  function handleConfirmDisconnect() {
    if (!disconnectTarget) return;
    setActionError(null);
    disconnectMutation.mutate(disconnectTarget.installationLinkId, {
      onSuccess: () => {
        setDisconnectTarget(null);
        setSelectedRepositoryIds([]);
        void installationsQuery.refetch();
      },
      onError: (error) => {
        setActionError(getGitHubAppApiErrorMessage(error));
      },
    });
  }

  const generation = generationQuery.data;
  // Only a running generation blocks a new start; terminal states do not.
  const hasActiveGeneration =
    generation !== undefined && isGenerationActive(generation.status);
  const isConnecting =
    startInstallationMutation.isPending || completeInstallationMutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 md:px-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Github className="mt-0.5 size-6 shrink-0 text-foreground" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t("githubSkillPage.title")}
                <span className="ms-2 rounded-full border border-border px-2 py-0.5 align-middle text-[11px] font-normal text-muted-foreground">
                  {t("common.optional")}
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {t("githubSkillPage.description")}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <a href={ROUTES.settings}>
              <ArrowRight className="size-4" />
              {t("navigation.settings")}
            </a>
          </Button>
        </div>
      </Card>

      {callbackPhase.kind === "error" && (
        <Card className="border-destructive/40 bg-destructive/5">
          <p role="alert" className="text-sm text-destructive">
            {getGitHubAppErrorMessage(callbackPhase.code)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {callbackPhase.restartable && (
              <Button
                type="button"
                size="sm"
                disabled={isConnecting}
                onClick={() => {
                  clearCallbackSearch();
                  startConnection();
                }}
              >
                <RefreshCw className="size-4" />
                {t("githubSkillPage.restart")}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearCallbackSearch}
            >
              {t("githubSkillPage.dismiss")}
            </Button>
          </div>
        </Card>
      )}

      {callbackPhase.kind === "resolving" && (
        <Card>
          {attemptQuery.isPending && (
            <p className="text-sm text-muted-foreground">
              {t("githubSkillPage.completing")}
            </p>
          )}
          {attemptQuery.isError && (
            <>
              <p role="alert" className="text-sm text-destructive">
                {getGitHubAppApiErrorMessage(attemptQuery.error)}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                disabled={isConnecting}
                onClick={() => {
                  clearCallbackSearch();
                  startConnection();
                }}
              >
                <RefreshCw className="size-4" />
                {t("githubSkillPage.restart")}
              </Button>
            </>
          )}
          {attemptQuery.data &&
            getAutoSelectableCandidateId(attemptQuery.data.candidates) ===
              null && (
              <GitHubAppCandidatePicker
                candidates={attemptQuery.data.candidates}
                isSubmitting={completeInstallationMutation.isPending}
                errorMessage={
                  completeInstallationMutation.isError
                    ? getGitHubAppApiErrorMessage(
                        completeInstallationMutation.error,
                      )
                    : null
                }
                onSelect={(providerInstallationId) => {
                  completeAttempt(
                    attemptQuery.data.attemptId,
                    providerInstallationId,
                  );
                }}
                onRestart={() => {
                  clearCallbackSearch();
                  startConnection();
                }}
              />
            )}
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground">
            {t("githubSkillPage.installations")}
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isConnecting}
            onClick={() => startConnection()}
          >
            <Github className="size-4" />
            {t("githubSkillPage.connectAccount")}
          </Button>
        </div>

        {installationsQuery.isPending && (
          <p className="mt-4 text-xs text-muted-foreground">
            {t("githubSkillPage.loadingInstallations")}
          </p>
        )}

        {installationsQuery.isError && (
          <p role="alert" className="mt-4 text-xs text-destructive">
            {getGitHubAppApiErrorMessage(installationsQuery.error)}
          </p>
        )}

        {installationsQuery.isSuccess && installations.length === 0 && (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {t("githubSkillPage.emptyInstallations")}
          </p>
        )}

        {installations.length > 0 && (
          <div className="mt-4">
            <GitHubAppInstallationList
              installations={installations}
              selectedInstallationLinkId={selectedInstallationLinkId}
              busyInstallationLinkId={
                disconnectMutation.isPending
                  ? (disconnectTarget?.installationLinkId ?? null)
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
      </Card>

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
          onConfirm={handleConfirmDisconnect}
        />
      )}

      {selectedInstallation && (
        <>
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

          <Card>
            <SkillAnalysisConsent
              accepted={consentAccepted}
              disabled={hasActiveGeneration}
              onChange={setConsentAccepted}
            />

            {actionError && (
              <p role="alert" className="mt-3 text-xs text-destructive">
                {actionError}
              </p>
            )}

            <div className="mt-4">
              <Button
                type="button"
                onClick={handleStartGeneration}
                disabled={
                  !canStartGeneration({
                    installationLinkId:
                      selectedInstallation.installationLinkId,
                    selectedRepositoryIds,
                    consentAccepted,
                    isSubmitting: startGenerationMutation.isPending,
                    hasActiveGeneration,
                  })
                }
              >
                {startGenerationMutation.isPending
                  ? t("githubSkillPage.starting")
                  : t("githubSkillPage.start")}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("githubSkillPage.startHelp")}
              </p>
            </div>
          </Card>
        </>
      )}

      {generation && (
        <SkillGenerationStatusPanel
          generation={generation}
          isRetrying={retryGenerationMutation.isPending}
          retryDisabled={!retryConsentAccepted}
          errorMessage={actionError}
          onRetry={handleRetryGeneration}
          retryConsentSlot={
            <SkillAnalysisConsent
              id="skill-analysis-retry-consent"
              accepted={retryConsentAccepted}
              onChange={setRetryConsentAccepted}
              disabled={retryGenerationMutation.isPending}
            />
          }
        />
      )}
    </div>
  );
}
