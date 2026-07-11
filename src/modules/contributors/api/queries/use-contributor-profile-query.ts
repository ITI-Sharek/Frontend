import { useQuery } from "@tanstack/react-query";

import { getContributorProfileByUsername } from "../../services/contributors.service";
import { contributorProfileKeys } from "../query-keys";

export function useContributorProfileQuery(username: string) {
  return useQuery({
    queryKey: contributorProfileKeys.detail(username),
    queryFn: () => getContributorProfileByUsername(username),
    enabled: username.trim().length > 0,
  });
}
