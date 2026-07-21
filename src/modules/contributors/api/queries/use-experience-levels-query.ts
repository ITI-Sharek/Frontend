import { queryOptions, useQuery } from "@tanstack/react-query";

import { listExperienceLevels } from "../../services/contributor-profile-completion.service";
import { contributorProfileKeys } from "../query-keys";

export const experienceLevelsQueryOptions = () =>
  queryOptions({
    queryKey: contributorProfileKeys.experienceLevels(),
    queryFn: listExperienceLevels,
    staleTime: 5 * 60 * 1000,
  });

export function useExperienceLevelsQuery() {
  return useQuery(experienceLevelsQueryOptions());
}
