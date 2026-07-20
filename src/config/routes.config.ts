export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  explore: "/explore",
  onboarding: "/onboarding",
  tasks: "/tasks",
  notifications: "/notifications",
  admin: "/admin",
  adminNotifications: "/admin/notifications",
  adminSkillReviews: "/admin/skill-reviews",
  adminSkillReview: (userId: string) =>
    `/admin/skill-reviews/${encodeURIComponent(userId)}`,
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  authCallback: "/auth/callback",
  myProjects: "/my-projects",
  settings: "/settings",
  contributorProfile: (username: string) =>
    `/profile/${encodeURIComponent(username)}`,
} as const;

export type PostLoginUser = {
  role: "owner" | "contributor" | "admin";
  username?: string | null;
};

export function getPostLoginPath(user: PostLoginUser): string {
  if (user.role === "admin") {
    return ROUTES.admin;
  }

  if (user.role === "contributor") {
    return user.username
      ? ROUTES.contributorProfile(user.username)
      : ROUTES.onboarding;
  }

  // The owner dashboard variant (docs/design/wireframes/09-owner-dashboard.md)
  // isn't built yet — /my-projects is the owner's working landing page today.
  return ROUTES.myProjects;
}
