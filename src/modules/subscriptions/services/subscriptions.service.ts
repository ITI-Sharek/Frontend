import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  CreateSubscriptionCheckoutPayload,
  PaymentCheckoutDto,
  PaymentStatusDto,
  SubscriptionPlanStatusDto,
} from "../types/subscription.types";

export async function getSubscriptionStatus(): Promise<SubscriptionPlanStatusDto> {
  const { data } = await axiosInstance.get<SubscriptionPlanStatusDto>(
    "/me/subscription",
  );
  return data;
}

export async function createSubscriptionCheckout(
  payload: CreateSubscriptionCheckoutPayload,
): Promise<PaymentCheckoutDto> {
  const { data } = await axiosInstance.post<PaymentCheckoutDto>(
    "/me/subscription/checkout",
    payload,
    { headers: { "Idempotency-Key": payload.idempotencyKey } },
  );
  return data;
}

export async function getPaymentStatus(
  paymentId: string,
): Promise<PaymentStatusDto> {
  const { data } = await axiosInstance.get<PaymentStatusDto>(
    `/me/payments/${encodeURIComponent(paymentId)}`,
  );
  return data;
}
