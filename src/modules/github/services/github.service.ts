import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  GitHubAccountDto,
  GitHubOAuthCallbackPayload,
  GitHubOAuthStartDto,
  GitHubRepositoryCommitSignalsDto,
  GitHubRepositoryContributionActivityDto,
  GitHubRepositoryDto,
  GitHubRepositoryStatisticsDto,
} from "../types/github.types";

export async function startGitHubOAuth(): Promise<GitHubOAuthStartDto> {
  const { data } =
    await axiosInstance.get<GitHubOAuthStartDto>("/github/oauth/start");
  return data;
}

export async function completeGitHubOAuth(
  payload: GitHubOAuthCallbackPayload,
): Promise<GitHubAccountDto> {
  const { data } = await axiosInstance.post<GitHubAccountDto>(
    "/github/oauth/callback",
    payload,
  );
  return data;
}

export async function getGitHubAccount(): Promise<GitHubAccountDto> {
  const { data } =
    await axiosInstance.get<GitHubAccountDto>("/github/account");
  return data;
}

export async function listGitHubRepositories(): Promise<GitHubRepositoryDto[]> {
  const { data } =
    await axiosInstance.get<GitHubRepositoryDto[]>("/github/repositories");
  return data;
}

export async function getGitHubRepositoryStatistics(
  fullName: string,
): Promise<GitHubRepositoryStatisticsDto> {
  const { data } = await axiosInstance.get<GitHubRepositoryStatisticsDto>(
    "/github/repository/statistics",
    { params: { fullName } },
  );
  return data;
}

export async function getGitHubRepositoryContributionActivity(
  fullName: string,
): Promise<GitHubRepositoryContributionActivityDto> {
  const { data } =
    await axiosInstance.get<GitHubRepositoryContributionActivityDto>(
      "/github/repository/contribution-activity",
      { params: { fullName } },
    );
  return data;
}

export async function getGitHubRepositoryCommitSignals({
  fullName,
  author,
}: {
  fullName: string;
  author?: string;
}): Promise<GitHubRepositoryCommitSignalsDto> {
  const { data } = await axiosInstance.get<GitHubRepositoryCommitSignalsDto>(
    "/github/repository/commit-signals",
    { params: { fullName, ...(author ? { author } : {}) } },
  );
  return data;
}

export async function disconnectGitHubAccount(): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.delete<{ success: boolean }>(
    "/github/account",
  );
  return data;
}
