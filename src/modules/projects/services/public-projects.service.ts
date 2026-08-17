import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  PublicProjectDetailDto,
  PublicProjectApplicantsResponseDto,
  PublicProjectSavedStateDto,
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

export async function getPublishedProjectApplicants(
  projectSlug: string,
): Promise<PublicProjectApplicantsResponseDto> {
  const { data } = await axiosInstance.get<PublicProjectApplicantsResponseDto>(
    `/public/projects/${encodeURIComponent(projectSlug)}/applicants`,
  );
  return data;
}

export async function getPublishedProjectSavedState(
  projectSlug: string,
): Promise<PublicProjectSavedStateDto> {
  const { data } = await axiosInstance.get<PublicProjectSavedStateDto>(
    `/public/projects/${encodeURIComponent(projectSlug)}/save`,
  );
  return data;
}

export async function savePublishedProject(
  projectSlug: string,
): Promise<PublicProjectSavedStateDto> {
  const { data } = await axiosInstance.post<PublicProjectSavedStateDto>(
    `/public/projects/${encodeURIComponent(projectSlug)}/save`,
  );
  return data;
}

export async function unsavePublishedProject(
  projectSlug: string,
): Promise<PublicProjectSavedStateDto> {
  const { data } = await axiosInstance.delete<PublicProjectSavedStateDto>(
    `/public/projects/${encodeURIComponent(projectSlug)}/save`,
  );
  return data;
}
