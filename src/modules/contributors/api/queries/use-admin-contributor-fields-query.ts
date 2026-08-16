import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminContributorFieldCategory,
  createAdminContributorField,
  listAdminContributorFieldCategories,
  listAdminContributorFields,
  updateAdminContributorFieldCategory,
  updateAdminContributorField,
} from "../../services/admin-contributor-fields.service";
import type {
  CreateContributorFieldCategoryPayload,
  CreateContributorFieldPayload,
} from "../../services/admin-contributor-fields.service";
import { contributorProfileKeys } from "../query-keys";

export function useAdminContributorFieldsQuery() {
  return useQuery({
    queryKey: contributorProfileKeys.adminFields(),
    queryFn: listAdminContributorFields,
  });
}

export function useAdminContributorFieldCategoriesQuery() {
  return useQuery({
    queryKey: contributorProfileKeys.adminFieldCategories(),
    queryFn: listAdminContributorFieldCategories,
  });
}

function invalidateFieldCatalogs(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: contributorProfileKeys.adminFields(),
    }),
    queryClient.invalidateQueries({
      queryKey: contributorProfileKeys.adminFieldCategories(),
    }),
    queryClient.invalidateQueries({
      queryKey: contributorProfileKeys.fields(),
    }),
  ]);
}

export function useCreateContributorFieldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContributorFieldPayload) =>
      createAdminContributorField(payload),
    onSuccess: () => invalidateFieldCatalogs(queryClient),
  });
}

export function useCreateContributorFieldCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContributorFieldCategoryPayload) =>
      createAdminContributorFieldCategory(payload),
    onSuccess: () => invalidateFieldCatalogs(queryClient),
  });
}

export function useUpdateContributorFieldCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: { active?: boolean; sortOrder?: number; labelEn?: string; labelAr?: string };
    }) => updateAdminContributorFieldCategory(categoryId, payload),
    onSuccess: () => invalidateFieldCatalogs(queryClient),
  });
}

export function useUpdateContributorFieldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      payload,
    }: {
      fieldId: string;
      payload: {
        categoryId?: string;
        active?: boolean;
        sortOrder?: number;
        labelEn?: string;
        labelAr?: string;
      };
    }) => updateAdminContributorField(fieldId, payload),
    onSuccess: () => invalidateFieldCatalogs(queryClient),
  });
}
