import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateContributorProfileDetails } from "../../services/contributor-profile-completion.service";
import type { UpdateProfileDetailsPayload } from "../../services/contributor-profile-completion.service";
import type { ContributorProfileDto } from "../../types/contributor-profile.types";
import { contributorProfileKeys } from "../query-keys";

export function useUpdateProfileDetailsMutation(
  profile: ContributorProfileDto,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileDetailsPayload) =>
      updateContributorProfileDetails(profile, payload),
    onSuccess: (updated) => {
      // Mock-phase note: the backend has no persistence for this yet, so a
      // hard refetch would revert the edit. Once the real PATCH endpoint
      // lands, switch to invalidateQueries and drop setQueryData.
      queryClient.setQueryData(
        contributorProfileKeys.detail(updated.username),
        updated,
      );
      queryClient.setQueryData(contributorProfileKeys.me(), updated);
    },
  });
}
