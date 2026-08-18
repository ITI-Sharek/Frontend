export const ROUTES = {
  landing: "/lp",
  home: "/home",
  dashboard: "/dashboard",
  explore: "/explore",
  publicProjects: "/projects",
  onboarding: "/onboarding",
  tasks: "/tasks",
  task: (taskId: string) => `/tasks/${encodeURIComponent(taskId)}`,
  notifications: "/notifications",
  messages: "/messages",
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
  ownerProject: (projectId: string) =>
    `/my-projects/${encodeURIComponent(projectId)}`,
  ownerContributionRequests: (projectId: string) =>
    `/my-projects/${encodeURIComponent(projectId)}/contribution-requests`,
  newContributionRequest: (projectId: string) =>
    `/my-projects/${encodeURIComponent(projectId)}/contribution-requests/new`,
  contributionRequest: (requestId: string) =>
    `/contribution-requests/${encodeURIComponent(requestId)}`,
  proposals: "/proposals",
  /**
   * Pathname only. `/proposals/new` takes `projectId` as a validated search
   * param, which a `<Link>` must pass via `search={{ projectId }}` — a query
   * string embedded in `to` is treated as part of the path and never reaches
   * the route's search validation.
   */
  newProposal: "/proposals/new",
  proposal: (proposalId: string) =>
    `/proposals/${encodeURIComponent(proposalId)}`,
  application: (applicationId: string) =>
    `/applications/${encodeURIComponent(applicationId)}`,
  settings: "/settings",
  /** Where every upgrade call to action lands. */
  plan: "/plan",
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

  // The contributor dashboard is the action-ranked home for the full
  // contribution journey. Owners retain their separate workspace hub.
  return user.role === "contributor" ? ROUTES.dashboard : ROUTES.home;
}
