export const eligibilityQueryKeys = {
  forRequest: (contributionRequestId: string) =>
    ["eligibility", "request", contributionRequestId] as const,
  guidance: (guidanceId: string) =>
    ["eligibility", "guidance", guidanceId] as const,
};
