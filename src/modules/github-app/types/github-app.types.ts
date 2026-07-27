/**
 * GitHub App repository authorization (feature 004). This is deliberately
 * separate from GitHub social login (`/auth/github/account`) and from the
 * retired repository OAuth flow (`/github/oauth/*`).
 */

export type GitHubAppAccountType = "user" | "organization";

export type GitHubAppInstallationStatus =
  | "active"
  | "disconnected"
  | "reauthorization_required"
  | "revoked";

export type GitHubAppRepositorySelection = "selected" | "all";

export type GitHubAppInstallationFlowType =
  | "install_and_authorize"
  | "authorize_existing_installation";

export interface StartGitHubAppInstallationPayload {
  flowType: GitHubAppInstallationFlowType;
  /** Required only for `authorize_existing_installation`. */
  installationLinkId?: string;
}

export interface GitHubAppConnectionStartDto {
  /** Provider URL to navigate to. Never construct this on the client. */
  installationUrl: string;
  expiresAt: string;
}

export interface GitHubAppInstallationCandidateDto {
  providerInstallationId: string;
  accountLogin: string;
  accountType: GitHubAppAccountType;
}

export interface GitHubAppConnectionAttemptDto {
  attemptId: string;
  expiresAt: string;
  candidates: GitHubAppInstallationCandidateDto[];
}

export interface CompleteGitHubAppInstallationPayload {
  attemptId: string;
  providerInstallationId: string;
}

export interface GitHubAppInstallationLinkDto {
  installationLinkId: string;
  providerInstallationId: string;
  accountLogin: string;
  accountType: GitHubAppAccountType;
  status: GitHubAppInstallationStatus;
  repositorySelection: GitHubAppRepositorySelection;
  installedAt: string;
  verifiedAt: string | null;
  manageUrl: string | null;
}

export interface GitHubAppRepositoryDto {
  /** Immutable numeric GitHub repository ID — the only selection value. */
  repositoryId: string;
  /** Display only. Never submitted as authorization input. */
  fullName: string;
  visibility: string;
  defaultBranch: string | null;
}

export interface GitHubAppRepositoryPageDto {
  items: GitHubAppRepositoryDto[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
  verifiedAt: string;
}

export interface DisconnectGitHubAppInstallationDto {
  success: boolean;
  manageUrl: string | null;
}
