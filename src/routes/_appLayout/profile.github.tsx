import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Github, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { requireMemberRoute, useCurrentUserQuery } from "@/modules/auth";
import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
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
import { startGitHubConnect, useGitHubAccountQuery } from "@/modules/github";
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
  beforeLoad: requireMemberRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  validateSearch: validateGithubSkillAnalysisSearch,
  component: GithubConnectionsRoute,
});

/**
 * The GitHub App is useful to both member roles, but skill generation remains
 * contributor-only. Keeping the role split at the component boundary means
 * the contributor-only hooks are never mounted for owners.
 */
function GithubConnectionsRoute() {
  const { t } = useTranslation();
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isPending || !currentUserQuery.data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
        <Card>
          <p className="text-sm text-muted-foreground">
            {t("settings.loadingProfile")}
          </p>
        </Card>
      </div>
    );
  }

  return currentUserQuery.data.role === "owner" ? (
    <OwnerGithubConnectionPage />
  ) : (
    <GithubSkillAnalysisPage />
  );
}

/** Owner surface for linking the matching GitHub identity and App installs. */
function OwnerGithubConnectionPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const callbackPhase = getCallbackPhase(search);

  const githubAccountQuery = useGitHubAccountQuery();
  const installationsQuery = useGitHubAppInstallationsQuery();
  const attemptQuery = useGitHubAppConnectionAttemptQuery({
    attemptId:
      callbackPhase.kind === "resolving" ? callbackPhase.attemptId : "",
    enabled: callbackPhase.kind === "resolving",
  });

  const startInstallationMutation = useStartGitHubAppInstallationMutation();
  const completeInstallationMutation =
    useCompleteGitHubAppInstallationMutation();
  const disconnectMutation = useDisconnectGitHubAppInstallationMutation();

  const [selectedInstallationLinkId, setSelectedInstallationLinkId] = useState<
    string | null
  >(null);
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [disconnectTarget, setDisconnectTarget] =
    useState<GitHubAppInstallationLinkDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [identityConnectPending, setIdentityConnectPending] = useState(false);

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
    completeAttempt(attempt.attemptId, providerInstallationId);
  }, [attemptQuery.data]);

  function clearCallbackSearch() {
    void navigate({
      to: GITHUB_SKILL_ANALYSIS_PATH,
      search: {},
      replace: true,
    });
  }

  function completeAttempt(attemptId: string, providerInstallationId: string) {
    setActionError(null);
    completeInstallationMutation.mutate(
      { attemptId, providerInstallationId },
      {
        onSuccess: (installation) => {
          setSelectedInstallationLinkId(installation.installationLinkId);
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
        onSuccess: (connection) => {
          window.location.assign(connection.installationUrl);
        },
        onError: (error) => {
          setActionError(getGitHubAppApiErrorMessage(error));
        },
      },
    );
  }

  async function connectIdentity() {
    setIdentityConnectPending(true);
    setActionError(null);
    try {
      await startGitHubConnect(ROUTES.githubSkillAnalysis);
    } catch (error) {
      setIdentityConnectPending(false);
      setActionError(
        getApiErrorMessage(error, t("ownerGithubPage.identityConnectError")),
      );
    }
  }

  function handleConfirmDisconnect() {
    if (!disconnectTarget) return;
    setActionError(null);
    disconnectMutation.mutate(disconnectTarget.installationLinkId, {
      onSuccess: () => {
        setDisconnectTarget(null);
        setSelectedInstallationLinkId(null);
        void installationsQuery.refetch();
      },
      onError: (error) => {
        setActionError(getGitHubAppApiErrorMessage(error));
      },
    });
  }

  const isConnecting =
    startInstallationMutation.isPending ||
    completeInstallationMutation.isPending;
  const accountErrorCode = getApiErrorCode(githubAccountQuery.error);
  const isIdentityConnected = githubAccountQuery.data !== undefined;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-6 md:px-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Github className="mt-0.5 size-6 shrink-0 text-foreground" />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t("ownerGithubPage.title")}
              </h1>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                {t("ownerGithubPage.description")}
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <a href={ROUTES.newProject}>
              <ArrowRight className="size-4" />
              {t("ownerGithubPage.backToProject")}
            </a>
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-foreground">
          {t("ownerGithubPage.identityTitle")}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("ownerGithubPage.identityDescription")}
        </p>
        {isIdentityConnected ? (
          <p className="mt-4 text-sm text-foreground">
            {t("ownerGithubPage.connectedAs", {
              username: githubAccountQuery.data.username,
            })}
          </p>
        ) : accountErrorCode === "GITHUB_ACCOUNT_NOT_CONNECTED" ? (
          <Button
            type="button"
            className="mt-4"
            disabled={identityConnectPending}
            onClick={() => void connectIdentity()}
          >
            <Github className="size-4" />
            {identityConnectPending
              ? t("ownerGithubPage.connecting")
              : t("ownerGithubPage.connectIdentity")}
          </Button>
        ) : githubAccountQuery.isError ? (
          <p role="alert" className="mt-4 text-xs text-destructive">
            {getApiErrorMessage(
              githubAccountQuery.error,
              t("ownerGithubPage.identityLoadError"),
            )}
          </p>
        ) : null}
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
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {t("ownerGithubPage.installationsTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("ownerGithubPage.installationsDescription")}
            </p>
          </div>
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
              onSelect={(installationLinkId) => {
                setSelectedInstallationLinkId(installationLinkId);
                setRepositoryPage(1);
              }}
              onReauthorize={startConnection}
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
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            {t("ownerGithubPage.repositoriesTitle")}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("ownerGithubPage.repositoriesDescription")}
          </p>
          {repositoriesQuery.isPending && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t("githubApp.repositories.loading")}
            </p>
          )}
          {repositoriesQuery.isError && (
            <p role="alert" className="mt-4 text-xs text-destructive">
              {getGitHubAppApiErrorMessage(repositoriesQuery.error)}
            </p>
          )}
          {!repositoriesQuery.isPending &&
            !repositoriesQuery.isError &&
            repositoriesQuery.data.items.length === 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                {t("githubApp.repositories.empty")}
              </p>
            )}
          {(repositoriesQuery.data?.items.length ?? 0) > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {repositoriesQuery.data?.items.map((repository) => (
                <li
                  key={repository.repositoryId}
                  className="rounded-input border border-border bg-background px-4 py-3"
                >
                  <span dir="ltr" className="font-mono text-sm text-foreground">
                    {repository.fullName}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {repository.visibility}
                    {repository.defaultBranch
                      ? ` · ${repository.defaultBranch}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={repositoryPage <= 1 || repositoriesQuery.isFetching}
              onClick={() => setRepositoryPage((page) => page - 1)}
            >
              {t("common.previous")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("githubApp.repositories.page", { page: repositoryPage })}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                !repositoriesQuery.data?.hasNextPage ||
                repositoriesQuery.isFetching
              }
              onClick={() => setRepositoryPage((page) => page + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        </Card>
      )}

      {actionError && (
        <p role="alert" className="text-xs text-destructive">
          {actionError}
        </p>
      )}
    </div>
  );
}

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
    attemptId:
      callbackPhase.kind === "resolving" ? callbackPhase.attemptId : "",
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
    void navigate({
      to: GITHUB_SKILL_ANALYSIS_PATH,
      search: {},
      replace: true,
    });
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
    startInstallationMutation.isPending ||
    completeInstallationMutation.isPending;

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
                    installationLinkId: selectedInstallation.installationLinkId,
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
