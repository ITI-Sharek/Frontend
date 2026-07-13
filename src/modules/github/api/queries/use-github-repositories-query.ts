import { queryOptions, useQuery } from "@tanstack/react-query";

import { listGitHubRepositories } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubRepositoriesQueryOptions({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  return queryOptions({
    queryKey: githubKeys.repositories(),
    queryFn: listGitHubRepositories,
    enabled,
  });
}

export function useGitHubRepositoriesQuery({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  return useQuery(githubRepositoriesQueryOptions({ enabled }));
}
