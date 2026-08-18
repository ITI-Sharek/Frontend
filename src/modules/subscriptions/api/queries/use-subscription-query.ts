import { useQuery } from "@tanstack/react-query";

import { subscriptionQueryKeys } from "../query-keys";
import {
  getPaymentStatus,
  getSubscriptionStatus,
} from "../../services/subscriptions.service";

const PAYMENT_STATUS_POLL_INTERVAL_MS = 2_000;

export function useSubscriptionStatusQuery() {
  return useQuery({
    queryKey: subscriptionQueryKeys.status,
    queryFn: getSubscriptionStatus,
    retry: false,
  });
}

export function usePaymentStatusQuery(
  paymentId: string | null,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.paymentStatus(paymentId ?? "missing"),
    queryFn: () => getPaymentStatus(paymentId as string),
    enabled: Boolean(paymentId) && (options.enabled ?? true),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "pending"
        ? PAYMENT_STATUS_POLL_INTERVAL_MS
        : false,
  });
}
