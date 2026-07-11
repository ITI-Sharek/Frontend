export const contributorProfileKeys = {
  all: ["contributors", "profiles"] as const,
  detail: (username: string) =>
    [...contributorProfileKeys.all, "detail", username] as const,
  me: () => [...contributorProfileKeys.all, "me"] as const,
};
