import { useQuery } from "@tanstack/react-query";

import { listOwnerContributionRequestsForProject } from "../../services/contribution-requests.service";
import { contributionRequestKeys } from "../query-keys";

export function useOwnerProjectContributionRequestsQuery(projectId: string) {
  return useQuery({
    queryKey: contributionRequestKeys.ownerProjectList(projectId),
    queryFn: () => listOwnerContributionRequestsForProject(projectId),
    retry: false,
  });
}
