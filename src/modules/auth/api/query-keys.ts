export const authKeys = {
  usernameAvailability: (username: string) =>
    ["auth", "username-availability", username.trim().toLowerCase()] as const,
  currentUser: () => ["auth", "current-user"] as const,
};
