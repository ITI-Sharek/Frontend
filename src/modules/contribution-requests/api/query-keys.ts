export const contributionRequestKeys = {
  all: ["contribution-requests"] as const,
  detail: (requestId: string) =>
    [...contributionRequestKeys.all, "detail", requestId] as const,
};
