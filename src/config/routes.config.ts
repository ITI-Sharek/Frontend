export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  explore: "/explore",
  onboarding: "/onboarding",
  tasks: "/tasks",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  authCallback: "/auth/callback",
  contributorProfile: (username: string) =>
    `/profile/${encodeURIComponent(username)}`,
} as const;

export type PostLoginUser = {
  role: "owner" | "contributor" | "admin";
  username?: string | null;
};

export function getPostLoginPath(user: PostLoginUser): string {
  if (user.role === "contributor" && user.username) {
    return ROUTES.contributorProfile(user.username);
  }

  return ROUTES.home;
}
