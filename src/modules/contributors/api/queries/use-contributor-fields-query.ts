import { queryOptions, useQuery } from "@tanstack/react-query";

import { listContributorFields } from "../../services/contributor-profile-completion.service";
import { contributorProfileKeys } from "../query-keys";

export const contributorFieldsQueryOptions = () =>
  queryOptions({
    queryKey: contributorProfileKeys.fields(),
    queryFn: listContributorFields,
    staleTime: 5 * 60 * 1000,
  });

export function useContributorFieldsQuery() {
  return useQuery(contributorFieldsQueryOptions());
}
