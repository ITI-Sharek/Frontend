import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ContributionRequestFeedView } from "@/modules/contribution-requests";
import type {
  ContributionRequestDifficulty,
  ContributionRequestFeedFiltersDto,
} from "@/modules/contribution-requests";

const DIFFICULTIES: ContributionRequestDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

/** Filters live in the URL (shareable, back-navigable) — same as /explore. */
export function validateContributionRequestSearch(
  search: Record<string, unknown>,
): ContributionRequestFeedFiltersDto {
  const filters: ContributionRequestFeedFiltersDto = {};
  if (typeof search.q === "string" && search.q.trim() !== "") {
    filters.q = search.q;
  }
  const tech = search.technologies;
  if (typeof tech === "string") {
    filters.technologies = [tech];
  } else if (
    Array.isArray(tech) &&
    tech.every((item): item is string => typeof item === "string") &&
    tech.length > 0
  ) {
    filters.technologies = tech;
  }
  if (
    DIFFICULTIES.includes(
      search.difficulty as ContributionRequestDifficulty,
    )
  ) {
    filters.difficulty = search.difficulty as ContributionRequestDifficulty;
  }
  if (
    search.hasReward === true ||
    search.hasReward === "true" ||
    search.hasReward === false ||
    search.hasReward === "false"
  ) {
    filters.hasReward =
      search.hasReward === true || search.hasReward === "true";
  }
  return filters;
}

export const Route = createFileRoute("/_appLayout/tasks/")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "طلبات المساهمة | Sharek" }] }),
  validateSearch: validateContributionRequestSearch,
  component: ContributionRequestsPage,
});

function ContributionRequestsPage() {
  const filters = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <ContributionRequestFeedView
      filters={filters}
      onFiltersChange={(partial) =>
        void navigate({
          search: { ...filters, ...partial },
          replace: true,
        })
      }
      onReset={() => void navigate({ search: {}, replace: true })}
      requestHref={(requestId) =>
        `${ROUTES.tasks}/${encodeURIComponent(requestId)}`
      }
    />
  );
}
