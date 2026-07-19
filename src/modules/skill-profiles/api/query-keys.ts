export const skillProfileKeys = {
  all: ["skill-profiles"] as const,
  generation: (generationId: string) =>
    [...skillProfileKeys.all, "generation", generationId] as const,
  adminReviews: () => [...skillProfileKeys.all, "admin-reviews"] as const,
  adminPendingReviews: (page: number, limit: number) =>
    [...skillProfileKeys.adminReviews(), "pending", page, limit] as const,
};
