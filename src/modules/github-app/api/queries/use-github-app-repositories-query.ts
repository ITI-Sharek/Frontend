import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import {
  GITHUB_APP_REPOSITORY_PAGE_SIZE,
  listGitHubAppRepositories,
} from "../../services/github-app.service";
import { githubAppKeys } from "../query-keys";

export function githubAppRepositoriesQueryOptions({
  installationLinkId,
  page = 1,
  perPage = GITHUB_APP_REPOSITORY_PAGE_SIZE,
  enabled = true,
}: {
  installationLinkId: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}) {
  return queryOptions({
    queryKey: githubAppKeys.repositories(installationLinkId, page, perPage),
    queryFn: () =>
      listGitHubAppRepositories({ installationLinkId, page, perPage }),
    enabled: enabled && installationLinkId !== "",
    placeholderData: keepPreviousData,
  });
}

export function useGitHubAppRepositoriesQuery({
  installationLinkId,
  page = 1,
  perPage = GITHUB_APP_REPOSITORY_PAGE_SIZE,
  enabled = true,
}: {
  installationLinkId: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}) {
  return useQuery(
    githubAppRepositoriesQueryOptions({
      installationLinkId,
      page,
      perPage,
      enabled,
    }),
  );
}
