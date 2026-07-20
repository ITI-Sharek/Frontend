import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateContributorProfileDetails,
  uploadContributorAvatar,
} from "../../services/contributor-profile-completion.service";
import { contributorProfileKeys } from "../query-keys";

export function useUpdateProfileDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContributorProfileDetails,
    onSuccess: (updated) => {
      queryClient.setQueryData(
        contributorProfileKeys.detail(updated.username),
        updated,
      );
      queryClient.setQueryData(contributorProfileKeys.me(), updated);
    },
  });
}

export function useUploadContributorAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadContributorAvatar,
    onSuccess: (updated) => {
      queryClient.setQueryData(
        contributorProfileKeys.detail(updated.username),
        updated,
      );
      queryClient.setQueryData(contributorProfileKeys.me(), updated);
    },
  });
}
