import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  DiscoverProjectsResponseDto,
  ExploreSearchParamsDto,
} from "../types/explore.types";

const DISCOVER_PAGE_SIZE = 12;

/** `GET /projects/discover` (TASK-3-05) — published-only discovery feed. */
export async function getExploreProjects(
  params: ExploreSearchParamsDto,
): Promise<DiscoverProjectsResponseDto> {
  const { data } = await axiosInstance.get<DiscoverProjectsResponseDto>(
    "/projects/discover",
    {
      params: {
        search: params.q,
        // Backend accepts a comma-separated list (or repeated values).
        technologies:
          params.technologies && params.technologies.length > 0
            ? params.technologies.join(",")
            : undefined,
        category: params.category,
        difficulty: params.difficulty,
        page: params.page,
        limit: DISCOVER_PAGE_SIZE,
      },
    },
  );

  return data;
}
