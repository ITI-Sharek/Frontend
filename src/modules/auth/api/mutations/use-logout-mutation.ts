import { useMutation, useQueryClient } from "@tanstack/react-query";

import { storageService } from "@/services/storage.service";

import { logoutUser } from "../../services/auth.service";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      // Clear local session state even if the backend call fails (e.g. token
      // already expired, or the server is unreachable) — the user still
      // wants to end up logged out locally.
      storageService.clearTokens();
      queryClient.clear();
    },
  });
}
