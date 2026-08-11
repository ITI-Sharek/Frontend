import { useQuery } from "@tanstack/react-query";

import { subscriptionQueryKeys } from "../query-keys";
import { getSubscriptionStatus } from "../../services/subscriptions.service";

export function useSubscriptionStatusQuery() {
  return useQuery({
    queryKey: subscriptionQueryKeys.status,
    queryFn: getSubscriptionStatus,
    retry: false,
  });
}
