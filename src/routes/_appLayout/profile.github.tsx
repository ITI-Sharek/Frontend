import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireMemberRoute } from "@/modules/auth";
import { validateGithubSkillAnalysisSearch } from "./profile.github.helpers";

export const GITHUB_SKILL_ANALYSIS_PATH = "/settings?section=github";

export const Route = createFileRoute("/_appLayout/profile/github")({
  beforeLoad: async (opts) => {
    await requireMemberRoute(opts);
    throw redirect({
      to: "/settings",
      search: {
        section: "github",
        attemptId: opts.search.attemptId,
        error: opts.search.error,
      },
    });
  },
  validateSearch: validateGithubSkillAnalysisSearch,
  component: () => null,
});
