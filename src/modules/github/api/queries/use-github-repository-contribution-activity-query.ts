import { queryOptions, useQuery } from "@tanstack/react-query";

import { getGitHubRepositoryContributionActivity } from "../../services/github.service";
import { githubKeys } from "../query-keys";

export function githubRepositoryContributionActivityQueryOptions({
  fullName,
  enabled = true,
}: {
  fullName: string;
  enabled?: boolean;
}) {
  const normalizedFullName = fullName.trim();

  return queryOptions({
    queryKey: githubKeys.repositoryContributionActivity(normalizedFullName),
    queryFn: () =>
      getGitHubRepositoryContributionActivity(normalizedFullName),
    enabled: enabled && normalizedFullName.length > 0,
  });
}

export function useGitHubRepositoryContributionActivityQuery({
  fullName,
  enabled = true,
}: {
  fullName: string;
  enabled?: boolean;
}) {
  return useQuery(
    githubRepositoryContributionActivityQueryOptions({ fullName, enabled }),
  );
}
