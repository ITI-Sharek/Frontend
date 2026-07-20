import { axiosInstance } from "@/lib/axios/axios-instance";

import type { GitHubRepositoryPageDto } from "@/modules/github/types/github.types";

import type {
  ImportDraftDto,
  MyProjectDto,
  OwnerQuotaDto,
  RepoPickDto,
} from "../types/my-projects.types";
import type { ImportedProjectDto } from "../types/project.types";

/**
 * Owner project APIs backed by the NestJS projects module.
 */

export async function getMyProjects(): Promise<{
  projects: MyProjectDto[];
  quota: OwnerQuotaDto;
}> {
  const { data } = await axiosInstance.get<{
    projects: MyProjectDto[];
    quota: OwnerQuotaDto;
  }>("/projects/me");

  return data;
}

export async function getOwnerRepos(): Promise<RepoPickDto[]> {
  const { data } =
    await axiosInstance.get<GitHubRepositoryPageDto>("/github/repositories");

  return data.items.map((repo) => ({
    fullName: repo.fullName,
    description: repo.description,
    language: repo.primaryLanguage,
    stars: repo.stars,
    isPrivate: repo.private,
  }));
}

export async function importRepoAsDraft(
  fullName: string,
): Promise<ImportDraftDto> {
  const { data } = await axiosInstance.post<ImportedProjectDto>(
    "/projects/import/github",
    {
      fullName,
      status: "draft",
    },
  );

  return toImportDraftDto(data);
}

export async function publishProject(
  fullName: string,
  metadata: Omit<ImportDraftDto, "fetchedFields">,
): Promise<ImportedProjectDto> {
  const { data } = await axiosInstance.post<ImportedProjectDto>(
    "/projects/import/github",
    {
      fullName,
      status: "published",
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      difficulty: metadata.difficulty,
      technologies: metadata.technologies,
    },
  );

  return data;
}

function toImportDraftDto(response: ImportedProjectDto): ImportDraftDto {
  const technologies = toStringArray(response.technologies);

  return {
    title: response.title,
    description: response.description ?? "",
    technologies,
    category: response.category,
    difficulty: response.difficulty,
    fetchedFields: getFetchedFields(response, technologies),
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function getFetchedFields(
  response: ImportedProjectDto,
  technologies: string[],
): string[] {
  return [
    response.title.trim() ? "title" : null,
    response.description?.trim() ? "description" : null,
    technologies.length > 0 ? "technologies" : null,
    response.category ? "category" : null,
    response.difficulty ? "difficulty" : null,
  ].filter((field): field is string => field !== null);
}
