import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  CompleteGitHubAppInstallationPayload,
  DisconnectGitHubAppInstallationDto,
  GitHubAppConnectionAttemptDto,
  GitHubAppConnectionStartDto,
  GitHubAppInstallationLinkDto,
  GitHubAppRepositoryPageDto,
  StartGitHubAppInstallationPayload,
} from "../types/github-app.types";

export const GITHUB_APP_REPOSITORY_PAGE_SIZE = 30;

export async function startGitHubAppInstallation(
  payload: StartGitHubAppInstallationPayload,
): Promise<GitHubAppConnectionStartDto> {
  const { data } = await axiosInstance.post<GitHubAppConnectionStartDto>(
    "/github/app/installations/start",
    payload,
  );
  return data;
}

export async function getGitHubAppConnectionAttempt(
  attemptId: string,
): Promise<GitHubAppConnectionAttemptDto> {
  const { data } = await axiosInstance.get<GitHubAppConnectionAttemptDto>(
    `/github/app/installations/attempts/${attemptId}`,
  );
  return data;
}

export async function completeGitHubAppInstallation(
  payload: CompleteGitHubAppInstallationPayload,
): Promise<GitHubAppInstallationLinkDto> {
  const { data } = await axiosInstance.post<GitHubAppInstallationLinkDto>(
    "/github/app/installations/callback",
    payload,
  );
  return data;
}

export async function listGitHubAppInstallations(): Promise<
  GitHubAppInstallationLinkDto[]
> {
  const { data } = await axiosInstance.get<GitHubAppInstallationLinkDto[]>(
    "/github/app/installations",
  );
  return data;
}

export async function listGitHubAppRepositories({
  installationLinkId,
  page = 1,
  perPage = GITHUB_APP_REPOSITORY_PAGE_SIZE,
}: {
  installationLinkId: string;
  page?: number;
  perPage?: number;
}): Promise<GitHubAppRepositoryPageDto> {
  const { data } = await axiosInstance.get<GitHubAppRepositoryPageDto>(
    "/github/app/repositories",
    { params: { installationLinkId, page, perPage } },
  );
  return data;
}

/**
 * Local disconnect only: disables Share-k reads through this link. It does not
 * uninstall the GitHub App and does not touch GitHub social login.
 */
export async function disconnectGitHubAppInstallation(
  installationLinkId: string,
): Promise<DisconnectGitHubAppInstallationDto> {
  const { data } = await axiosInstance.delete<DisconnectGitHubAppInstallationDto>(
    `/github/app/installations/${installationLinkId}`,
  );
  return data;
}
