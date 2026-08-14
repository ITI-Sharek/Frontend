import { axiosInstance } from "@/lib/axios/axios-instance";

import type { RecommendedTasksResponseDto } from "../types/matching.types";

export async function getRecommendedTasks(): Promise<RecommendedTasksResponseDto> {
  const { data } = await axiosInstance.get<RecommendedTasksResponseDto>(
    "/contributors/me/recommended-tasks",
  );
  return data;
}
