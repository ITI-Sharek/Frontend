import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ensureCurrentContributorProfile } from "../../services/contributors.service";
import { contributorProfileKeys } from "../query-keys";

export function useEnsureContributorProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ensureCurrentContributorProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(
        contributorProfileKeys.detail(profile.username),
        profile,
      );
      queryClient.setQueryData(contributorProfileKeys.me(), profile);
    },
  });
}
