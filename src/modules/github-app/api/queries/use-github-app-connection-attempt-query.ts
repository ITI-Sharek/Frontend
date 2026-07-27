import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGitHubAppConnectionAttempt } from "../../services/github-app.service";
import { githubAppKeys } from "../query-keys";

export function githubAppConnectionAttemptQueryOptions({
  attemptId,
  enabled = true,
}: {
  attemptId: string;
  enabled?: boolean;
}) {
  return queryOptions({
    queryKey: githubAppKeys.connectionAttempt(attemptId),
    queryFn: () => getGitHubAppConnectionAttempt(attemptId),
    enabled: enabled && attemptId !== "",
    // Attempts are single-use and short-lived: never silently replay them.
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useGitHubAppConnectionAttemptQuery({
  attemptId,
  enabled = true,
}: {
  attemptId: string;
  enabled?: boolean;
}) {
  return useQuery(
    githubAppConnectionAttemptQueryOptions({ attemptId, enabled }),
  );
}
