import { queryOptions, useQuery } from "@tanstack/react-query";

import { listPendingSkillReviews } from "../../services/admin-skill-reviews.service";
import { skillProfileKeys } from "../query-keys";

export function adminPendingSkillReviewsQueryOptions({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}) {
  return queryOptions({
    queryKey: skillProfileKeys.adminPendingReviews(page, limit),
    queryFn: () => listPendingSkillReviews({ page, limit }),
  });
}

export function useAdminPendingSkillReviewsQuery({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}) {
  return useQuery(adminPendingSkillReviewsQueryOptions({ page, limit }));
}
