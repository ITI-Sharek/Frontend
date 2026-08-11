export type SubscriptionRoleContext = "owner" | "contributor";
export type SubscriptionPlan = "bronze" | "silver" | "gold";
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type SubscriptionSource =
  | "default"
  | "admin"
  | "demo"
  | "payment_provider";

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
