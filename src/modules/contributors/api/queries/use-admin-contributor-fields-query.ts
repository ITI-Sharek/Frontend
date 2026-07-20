import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminContributorField,
  listAdminContributorFields,
  updateAdminContributorField,
} from "../../services/admin-contributor-fields.service";
import type { CreateContributorFieldPayload } from "../../services/admin-contributor-fields.service";
import { contributorProfileKeys } from "../query-keys";

export function useAdminContributorFieldsQuery() {
  return useQuery({
    queryKey: contributorProfileKeys.adminFields(),
    queryFn: listAdminContributorFields,
  });
}

export function useCreateContributorFieldMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContributorFieldPayload) =>
      createAdminContributorField(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.adminFields(),
        }),
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.fields(),
        }),
      ]);
    },
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
      payload: { active?: boolean; sortOrder?: number };
    }) => updateAdminContributorField(fieldId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.adminFields(),
        }),
        queryClient.invalidateQueries({
          queryKey: contributorProfileKeys.fields(),
        }),
      ]);
    },
  });
}
