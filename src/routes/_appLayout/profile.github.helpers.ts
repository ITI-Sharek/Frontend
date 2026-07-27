import { isRestartableCallbackError } from "@/modules/github-app";
import {
  MAX_ANALYSIS_REPOSITORIES,
  MIN_ANALYSIS_REPOSITORIES,
  SKILL_ANALYSIS_CONSENT_VERSION,
} from "@/modules/skill-profiles";
import type {
  GitHubAppInstallationCandidateDto,
  GitHubAppInstallationLinkDto,
} from "@/modules/github-app";
import type {
  SkillProfileAnalysisConsentPayload,
  StartSkillProfileGenerationPayload,
} from "@/modules/skill-profiles";

export interface GithubSkillAnalysisSearch {
  /** Opaque connection-attempt ID handed back by the backend callback. */
  attemptId?: string;
  /** Stable backend error code; never a provider payload. */
  error?: string;
}

/**
 * The backend redirects here with either `?attemptId=` or `?error=`. Provider
 * codes, states, and tokens never reach the browser, so nothing else is read.
 */
export function validateGithubSkillAnalysisSearch(
  search: Record<string, unknown>,
): GithubSkillAnalysisSearch {
  const result: GithubSkillAnalysisSearch = {};
  if (typeof search.attemptId === "string" && search.attemptId !== "") {
    result.attemptId = search.attemptId;
  }
  if (typeof search.error === "string" && search.error !== "") {
    result.error = search.error;
  }
  return result;
}

export type CallbackPhase =
  | { kind: "idle" }
  | { kind: "resolving"; attemptId: string }
  | { kind: "error"; code: string; restartable: boolean };

export function getCallbackPhase(
  search: GithubSkillAnalysisSearch,
): CallbackPhase {
  if (search.error) {
    return {
      kind: "error",
      code: search.error,
      restartable: isRestartableCallbackError(search.error),
    };
  }
  if (search.attemptId) {
    return { kind: "resolving", attemptId: search.attemptId };
  }
  return { kind: "idle" };
}

/** Exactly one candidate continues automatically; more than one asks the user. */
export function getAutoSelectableCandidateId(
  candidates: GitHubAppInstallationCandidateDto[] | undefined,
): string | null {
  if (!candidates || candidates.length !== 1) return null;
  return candidates[0].providerInstallationId;
}

export function buildConsent(): SkillProfileAnalysisConsentPayload {
  return { accepted: true, version: SKILL_ANALYSIS_CONSENT_VERSION };
}

export function buildStartGenerationPayload(
  installationLinkId: string,
  repositoryIds: string[],
): StartSkillProfileGenerationPayload {
  return {
    installationLinkId,
    repositoryIds,
    consent: buildConsent(),
  };
}

/**
 * Start is gated on: a usable installation, a 1..10 repository selection, and
 * explicit consent that is unchecked by default. Nothing here fires a request.
 */
export function canStartGeneration({
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

export function findInstallation(
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
