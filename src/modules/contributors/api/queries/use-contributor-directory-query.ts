import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ContributorDirectorySearchParamsDto } from "../../types/contributor-profile.types";
import { getContributorDirectory } from "../../services/contributors.service";
import { contributorProfileKeys } from "../query-keys";

export function useContributorDirectoryQuery(
  params: ContributorDirectorySearchParamsDto,
) {
  return useQuery({
    queryKey: contributorProfileKeys.directory(params),
    queryFn: () => getContributorDirectory(params),
    placeholderData: keepPreviousData,
  });
}
