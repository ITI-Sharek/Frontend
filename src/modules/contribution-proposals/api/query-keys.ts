export const contributionProposalKeys = {
  all: ["contribution-proposals"] as const,
  mine: () => ["contribution-proposals", "mine"] as const,
  project: (projectId: string) =>
    ["contribution-proposals", "project", projectId] as const,
  intake: (projectId: string) =>
    ["contribution-proposals", "intake", projectId] as const,
  detail: (proposalId: string) =>
    ["contribution-proposals", "detail", proposalId] as const,
};
