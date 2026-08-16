import { axiosInstance } from "@/lib/axios/axios-instance";

export interface AdminContributorFieldDto {
  id: string;
  categoryId: string;
  key: string;
  labelEn: string;
  labelAr: string;
  active: boolean;
  sortOrder: number;
  category: {
    id: string;
    key: string;
    labelEn: string;
    labelAr: string;
  } | null;
}

export interface AdminContributorFieldCategoryDto {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  active: boolean;
  sortOrder: number;
  fields: AdminContributorFieldDto[];
}

export interface CreateContributorFieldCategoryPayload {
  key: string;
  labelEn: string;
  labelAr: string;
  sortOrder?: number;
}

export interface CreateContributorFieldPayload {
  categoryId: string;
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

export async function listAdminContributorFieldCategories() {
  const { data } = await axiosInstance.get<AdminContributorFieldCategoryDto[]>(
    "/admin/contributor-field-categories",
  );
  return data;
}

export async function createAdminContributorFieldCategory(
  payload: CreateContributorFieldCategoryPayload,
) {
  const { data } = await axiosInstance.post<AdminContributorFieldCategoryDto>(
    "/admin/contributor-field-categories",
    payload,
  );
  return data;
}

export async function updateAdminContributorFieldCategory(
  categoryId: string,
  payload: Partial<
    Pick<AdminContributorFieldCategoryDto, "labelEn" | "labelAr" | "active" | "sortOrder">
  >,
) {
  const { data } = await axiosInstance.patch<AdminContributorFieldCategoryDto>(
    `/admin/contributor-field-categories/${categoryId}`,
    payload,
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
  payload: Partial<
    Pick<AdminContributorFieldDto, "categoryId" | "labelEn" | "labelAr" | "active" | "sortOrder">
  >,
) {
  const { data } = await axiosInstance.patch<AdminContributorFieldDto>(
    `/admin/contributor-fields/${fieldId}`,
    payload,
  );
  return data;
}
