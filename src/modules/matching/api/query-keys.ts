export const matchingQueryKeys = {
  all: ["matching"] as const,
  owner: (requestId: string) => ["matching", "owner", requestId] as const,
  recommendations: ["matching", "recommendations"] as const,
};
