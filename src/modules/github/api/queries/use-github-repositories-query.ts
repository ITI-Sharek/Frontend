import { queryOptions, useQuery } from "@tanstack/react-query";

import { listGitHubRepositories } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubRepositoriesQueryOptions({
  enabled = true,
  page = 1,
  perPage = 12,
}: {
  enabled?: boolean;
  page?: number;
  perPage?: number;
} = {}) {
  return queryOptions({
    queryKey: githubKeys.repositories(page, perPage),
    queryFn: () => listGitHubRepositories({ page, perPage }),
    enabled,
  });
}

export function useGitHubRepositoriesQuery({
  enabled = true,
  page = 1,
  perPage = 12,
}: {
  enabled?: boolean;
  page?: number;
  perPage?: number;
} = {}) {
  return useQuery(githubRepositoriesQueryOptions({ enabled, page, perPage }));
}
