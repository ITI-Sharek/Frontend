export const contributorProfileKeys = {
  all: ["contributors", "profiles"] as const,
  detail: (username: string) =>
    [...contributorProfileKeys.all, "detail", username] as const,
  me: () => [...contributorProfileKeys.all, "me"] as const,
  fields: () => [...contributorProfileKeys.all, "fields"] as const,
  adminFields: () => [...contributorProfileKeys.all, "admin-fields"] as const,
  experienceLevels: () =>
    [...contributorProfileKeys.all, "experience-levels"] as const,
  adminExperienceLevels: () =>
    [...contributorProfileKeys.all, "admin-experience-levels"] as const,
};
