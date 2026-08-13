import { axiosInstance } from "@/lib/axios/axios-instance";

import type { SubscriptionPlanStatusDto } from "../types/subscription.types";

export async function getSubscriptionStatus(): Promise<SubscriptionPlanStatusDto> {
  const { data } = await axiosInstance.get<SubscriptionPlanStatusDto>(
    "/me/subscription",
  );
  return data;
}
