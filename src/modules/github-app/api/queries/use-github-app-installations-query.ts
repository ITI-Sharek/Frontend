import { queryOptions, useQuery } from "@tanstack/react-query";

import { listGitHubAppInstallations } from "../../services/github-app.service";
import { githubAppKeys } from "../query-keys";

export function githubAppInstallationsQueryOptions({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return queryOptions({
    queryKey: githubAppKeys.installations(),
    queryFn: listGitHubAppInstallations,
    enabled,
  });
}

export function useGitHubAppInstallationsQuery({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery(githubAppInstallationsQueryOptions({ enabled }));
}
