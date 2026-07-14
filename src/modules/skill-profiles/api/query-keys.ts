export const skillProfileKeys = {
  all: ["skill-profiles"] as const,
  generation: (generationId: string) =>
    [...skillProfileKeys.all, "generation", generationId] as const,
};
