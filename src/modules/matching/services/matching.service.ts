import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  OwnerContributorMatchingResponseDto,
  RecommendedTasksResponseDto,
} from "../types/matching.types";

export async function getRecommendedTasks(): Promise<RecommendedTasksResponseDto> {
  const { data } = await axiosInstance.get<RecommendedTasksResponseDto>(
    "/contributors/me/recommended-tasks",
  );
  return data;
}

export async function generateOwnerContributorMatches(
  requestId: string,
): Promise<OwnerContributorMatchingResponseDto> {
  const { data } =
    await axiosInstance.post<OwnerContributorMatchingResponseDto>(
      `/contribution-requests/${encodeURIComponent(requestId)}/matches/generate`,
    );
  return data;
}
