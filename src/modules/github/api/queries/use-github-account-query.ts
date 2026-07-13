import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGitHubAccount } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubAccountQueryOptions() {
  return queryOptions({
    queryKey: githubKeys.account(),
    queryFn: getGitHubAccount,
  });
}

export function useGitHubAccountQuery() {
  return useQuery(githubAccountQueryOptions());
}
