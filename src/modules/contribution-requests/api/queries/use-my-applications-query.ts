import { useQuery } from "@tanstack/react-query";

import { getMyApplications } from "../../services/applications.service";
import { applicationsQueryKeys } from "../query-keys";
import type { ApplicationStatus } from "../../types/application.types";

export function useMyApplicationsQuery(status?: ApplicationStatus) {
  return useQuery({
    queryKey: applicationsQueryKeys.mine(status),
    queryFn: () => getMyApplications(status),
  });
}
