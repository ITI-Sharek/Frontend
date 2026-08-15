export { RecommendedTasksSection } from "./components/recommended-tasks-section";
export { OwnerContributorMatchingPanel } from "./components/owner-contributor-matching-panel";
export { useRecommendedTasksQuery } from "./api/queries/use-matching-queries";
export { matchingQueryKeys } from "./api/query-keys";
export {
  generateOwnerContributorMatches,
  getRecommendedTasks,
} from "./services/matching.service";
export type {
  MatchedSkillDto,
  MatchingConfidence,
  RecommendedTaskDto,
  RecommendedTasksReason,
  RecommendedTasksResponseDto,
  OwnerContributorMatchDto,
  OwnerContributorMatchingResponseDto,
} from "./types/matching.types";
