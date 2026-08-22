export const assignmentCallKeys = {
  all: ["assignment-calls"] as const,
  joinCredentials: (callId: string) => ["assignment-calls", "join-credentials", callId] as const,
};
