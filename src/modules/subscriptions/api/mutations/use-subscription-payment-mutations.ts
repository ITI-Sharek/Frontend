import { useMutation } from "@tanstack/react-query";

import { createSubscriptionCheckout } from "../../services/subscriptions.service";
import type { CreateSubscriptionCheckoutPayload } from "../../types/subscription.types";

/**
 * Starts one idempotent payment attempt. The caller owns the key so a retry of
 * the same click can replay the same backend attempt instead of creating a
 * second charge.
 */
export function useCreateSubscriptionCheckoutMutation() {
  return useMutation({
    mutationFn: (payload: CreateSubscriptionCheckoutPayload) =>
      createSubscriptionCheckout(payload),
  });
}
