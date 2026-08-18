export type SubscriptionRoleContext = "owner" | "contributor";
/**
 * One paid tier per role. `free` is the absence of a subscription, not a
 * downgrade — publishing and completing unpaid work costs nothing.
 */
export type SubscriptionPlan = "free" | "gold";
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type SubscriptionSource =
  | "default"
  | "admin"
  | "demo"
  | "payment_provider";

export type PaymentAttemptStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export interface CreateSubscriptionCheckoutPayload {
  planType: "gold";
  roleContext: SubscriptionRoleContext;
  idempotencyKey: string;
}

export interface PaymentCheckoutDto {
  paymentId: string;
  checkout: {
    provider: "paymob";
    /** Browser-safe Paymob client secret. The hosted URL is the navigation target. */
    clientSecret: string;
    checkoutUrl: string;
  };
}

export interface PaymentStatusDto {
  paymentId: string;
  planType: "gold";
  roleContext: SubscriptionRoleContext;
  amountCents: number;
  currency: string;
  status: PaymentAttemptStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface SubscriptionUsageDto {
  used: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

export interface SubscriptionBenefitDto {
  key: string;
  state: "included" | "unavailable" | "not_applicable";
  label: string;
}

export interface SubscriptionEntitlementDto {
  key: "PROJECT_MATERIAL_ANALYSIS";
  state: "granted" | "unavailable";
}

export interface SubscriptionPlanStatusDto {
  roleContext: SubscriptionRoleContext;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  usage: SubscriptionUsageDto | null;
  benefits: SubscriptionBenefitDto[];
  entitlements: SubscriptionEntitlementDto[];
}
