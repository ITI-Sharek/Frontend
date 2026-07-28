import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  PublicProjectDetailDto,
  PublicProjectsListParams,
  PublicProjectsListResponseDto,
} from "../types/public-project.types";

/**
 * Minimal public published-project reads
 * (`server/specs/003-github-project-publication/contracts/http-api.md` §9-10).
 */

export async function listPublishedProjects(
  params: PublicProjectsListParams = {},
): Promise<PublicProjectsListResponseDto> {
  const { data } = await axiosInstance.get<PublicProjectsListResponseDto>(
    "/public/projects",
    { params },
  );
  return data;
}

export async function getPublishedProjectBySlug(
  projectSlug: string,
): Promise<PublicProjectDetailDto> {
  const { data } = await axiosInstance.get<PublicProjectDetailDto>(
    `/public/projects/${encodeURIComponent(projectSlug)}`,
  );
  return data;
}
