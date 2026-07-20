import { useQuery } from "@tanstack/react-query";

import { listAdminPublishedProjectOwners } from "../../services/admin-published-project-owners.service";
import { projectsQueryKeys } from "../query-keys";

export function useAdminPublishedProjectOwnersQuery() {
  return useQuery({
    queryKey: projectsQueryKeys.adminPublishedOwners(),
    queryFn: listAdminPublishedProjectOwners,
  });
}
