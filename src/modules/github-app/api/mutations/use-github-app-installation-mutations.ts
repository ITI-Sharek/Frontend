import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  completeGitHubAppInstallation,
  disconnectGitHubAppInstallation,
  startGitHubAppInstallation,
} from "../../services/github-app.service";
import { githubAppKeys } from "../query-keys";

/**
 * Starts a connection and hands the browser to GitHub. Navigation happens in
 * the caller so tests can assert the request without a real redirect.
 */
export function useStartGitHubAppInstallationMutation() {
  return useMutation({ mutationFn: startGitHubAppInstallation });
}

export function useCompleteGitHubAppInstallationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeGitHubAppInstallation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: githubAppKeys.installations(),
      });
    },
  });
}

export function useDisconnectGitHubAppInstallationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectGitHubAppInstallation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: githubAppKeys.all });
    },
  });
}
