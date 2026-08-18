export const subscriptionQueryKeys = {
  all: ["subscription"] as const,
  status: ["subscription", "status"] as const,
  paymentStatus: (paymentId: string) =>
    ["subscription", "payment-status", paymentId] as const,
};
