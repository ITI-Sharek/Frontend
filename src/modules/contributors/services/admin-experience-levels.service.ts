import { axiosInstance } from "@/lib/axios/axios-instance";

export interface AdminExperienceLevelDto {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  active: boolean;
  sortOrder: number;
}

export interface CreateExperienceLevelPayload {
  key: string;
  labelEn: string;
  labelAr: string;
  sortOrder?: number;
}

export async function listAdminExperienceLevels() {
  const { data } = await axiosInstance.get<AdminExperienceLevelDto[]>(
    "/admin/experience-levels",
  );
  return data;
}

export async function createAdminExperienceLevel(
  payload: CreateExperienceLevelPayload,
) {
  const { data } = await axiosInstance.post<AdminExperienceLevelDto>(
    "/admin/experience-levels",
    payload,
  );
  return data;
}

export async function updateAdminExperienceLevel(
  levelId: string,
  payload: Partial<Pick<AdminExperienceLevelDto, "labelEn" | "labelAr" | "active" | "sortOrder">>,
) {
  const { data } = await axiosInstance.patch<AdminExperienceLevelDto>(
    `/admin/experience-levels/${levelId}`,
    payload,
  );
  return data;
}
