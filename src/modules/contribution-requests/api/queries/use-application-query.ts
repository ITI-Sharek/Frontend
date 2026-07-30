import { useQuery } from "@tanstack/react-query";

import { getApplication } from "../../services/applications.service";
import { applicationsQueryKeys } from "../query-keys";

export function useApplicationQuery(applicationId: string) {
  return useQuery({
    queryKey: applicationsQueryKeys.detail(applicationId),
    queryFn: () => getApplication(applicationId),
    enabled: applicationId !== "",
    retry: false,
  });
}
