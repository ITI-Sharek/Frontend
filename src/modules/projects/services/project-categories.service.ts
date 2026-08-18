import { axiosInstance } from "@/lib/axios/axios-instance";

import type { ProjectCategory, ProjectDifficulty } from "../types/project.types";

export interface ProjectCategoryDto {
  key: ProjectCategory;
  labelEn: string;
  labelAr: string;
}

export interface ProjectDifficultyDto {
  key: ProjectDifficulty;
  labelEn: string;
  labelAr: string;
}

export async function listProjectCategories(): Promise<ProjectCategoryDto[]> {
  const { data } = await axiosInstance.get<ProjectCategoryDto[]>("/projects/categories");
  return data;
}

export async function listProjectDifficulties(): Promise<ProjectDifficultyDto[]> {
  const { data } = await axiosInstance.get<ProjectDifficultyDto[]>("/projects/difficulties");
  return data;
}
