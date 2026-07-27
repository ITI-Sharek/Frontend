export const ROUTES = {
  landing: "/lp",
  home: "/home",
  dashboard: "/dashboard",
  explore: "/explore",
  onboarding: "/onboarding",
  tasks: "/tasks",
  notifications: "/notifications",
  discussions: "/discussions",
  discussion: (postId: string) => `/discussions/${encodeURIComponent(postId)}`,
  support: "/support",
  admin: "/admin",
  adminNotifications: "/admin/notifications",
  adminSkillReviews: "/admin/skill-reviews",
  adminProfileFields: "/admin/profile-fields",
  adminExperienceLevels: "/admin/experience-levels",
  adminProjectOwners: "/admin/project-owners",
  adminSkillReview: (userId: string) =>
    `/admin/skill-reviews/${encodeURIComponent(userId)}`,
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  authCallback: "/auth/callback",
  myProjects: "/my-projects",
  newProject: "/my-projects/new",
  settings: "/settings",
  /** Optional GitHub App skill-analysis workspace (backend callback target). */
  githubSkillAnalysis: "/profile/github",
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

  if (user.role === "contributor" && !user.username) {
    return ROUTES.onboarding;
  }

  // Both owners and contributors land on the shared workspace home hub.
  return ROUTES.home;
}
