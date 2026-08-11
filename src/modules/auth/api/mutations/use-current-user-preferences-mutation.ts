import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCurrentUserPreferences } from "../../services/auth.service";
import { authKeys } from "../query-keys";
import type { UpdateCurrentUserPreferencesDto } from "../../types/auth.types";

export function useUpdateCurrentUserPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCurrentUserPreferencesDto) =>
      updateCurrentUserPreferences(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
        refetchType: "active",
      });
    },
  });
}
