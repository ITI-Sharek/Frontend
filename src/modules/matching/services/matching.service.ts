import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  InviteMatchedContributorResponseDto,
  OwnerMatchesResponseDto,
  RecommendedTasksResponseDto,
} from "../types/matching.types";

export async function getOwnerMatches(
  requestId: string,
): Promise<OwnerMatchesResponseDto> {
  const { data } = await axiosInstance.get<OwnerMatchesResponseDto>(
    `/contribution-requests/${encodeURIComponent(requestId)}/matches`,
  );
  return data;
}

export async function generateOwnerMatches(
  requestId: string,
): Promise<OwnerMatchesResponseDto> {
  const { data } = await axiosInstance.post<OwnerMatchesResponseDto>(
    `/contribution-requests/${encodeURIComponent(requestId)}/matches/generate`,
  );
  return data;
}

export async function inviteMatchedContributor(
  requestId: string,
  contributorId: string,
): Promise<InviteMatchedContributorResponseDto> {
  const { data } =
    await axiosInstance.post<InviteMatchedContributorResponseDto>(
      `/contribution-requests/${encodeURIComponent(requestId)}/matches/${encodeURIComponent(contributorId)}/invite`,
    );
  return data;
}

export async function getRecommendedTasks(): Promise<RecommendedTasksResponseDto> {
  const { data } = await axiosInstance.get<RecommendedTasksResponseDto>(
    "/contributors/me/recommended-tasks",
  );
  return data;
}
