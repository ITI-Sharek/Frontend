import { createFileRoute } from "@tanstack/react-router";

import { PaymentResultPage } from "@/modules/subscriptions";
import { isPaymentId } from "@/modules/subscriptions/services/payment-session.service";

export type PaymentResultSearch = { paymentId?: string };

export function validatePaymentResultSearch(
  search: Record<string, unknown>,
): PaymentResultSearch {
  return {
    paymentId: isPaymentId(search.paymentId) ? search.paymentId : undefined,
  };
}

export const Route = createFileRoute("/_appLayout/payments/result")({
  validateSearch: validatePaymentResultSearch,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: PaymentResultRoute,
});

function PaymentResultRoute() {
  const { paymentId } = Route.useSearch();
  return <PaymentResultPage paymentId={paymentId} />;
}
