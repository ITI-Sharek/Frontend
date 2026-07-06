import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  GitHubAccountDto,
  GitHubOAuthCallbackPayload,
  GitHubOAuthStartDto,
  GitHubRepositoryDto,
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

export async function disconnectGitHubAccount(): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.delete<{ success: boolean }>(
    "/github/account",
  );
  return data;
}
