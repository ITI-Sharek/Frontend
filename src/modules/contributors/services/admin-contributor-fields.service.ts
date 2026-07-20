import { axiosInstance } from "@/lib/axios/axios-instance";

export interface AdminContributorFieldDto {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  active: boolean;
  sortOrder: number;
}

export interface CreateContributorFieldPayload {
  key: string;
  labelEn: string;
  labelAr: string;
  sortOrder?: number;
}

export async function listAdminContributorFields() {
  const { data } = await axiosInstance.get<AdminContributorFieldDto[]>(
    "/admin/contributor-fields",
  );
  return data;
}

export async function createAdminContributorField(
  payload: CreateContributorFieldPayload,
) {
  const { data } = await axiosInstance.post<AdminContributorFieldDto>(
    "/admin/contributor-fields",
    payload,
  );
  return data;
}

export async function updateAdminContributorField(
  fieldId: string,
  payload: Partial<Pick<AdminContributorFieldDto, "labelEn" | "labelAr" | "active" | "sortOrder">>,
) {
  const { data } = await axiosInstance.patch<AdminContributorFieldDto>(
    `/admin/contributor-fields/${fieldId}`,
    payload,
  );
  return data;
}
