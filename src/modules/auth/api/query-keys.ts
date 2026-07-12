export const authKeys = {
  usernameAvailability: (username: string) =>
    ["auth", "username-availability", username.trim().toLowerCase()] as const,
};
