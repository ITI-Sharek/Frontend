export const deliveryKeys = {
  all: ["delivery-reviews"] as const,
  contributorLifecycle: () =>
    [...deliveryKeys.all, "contributor-lifecycle"] as const,
  ownerLifecycle: () => [...deliveryKeys.all, "owner-lifecycle"] as const,
  ownerQueue: () => [...deliveryKeys.all, "owner-queue"] as const,
  detail: (deliveryId: string) =>
    [...deliveryKeys.all, "detail", deliveryId] as const,
};
