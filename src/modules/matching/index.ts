export { RecommendedTasksSection } from "./components/recommended-tasks-section";
export { useRecommendedTasksQuery } from "./api/queries/use-matching-queries";
export { matchingQueryKeys } from "./api/query-keys";
export { getRecommendedTasks } from "./services/matching.service";
export type {
  MatchedSkillDto,
  MatchingConfidence,
  RecommendedTaskDto,
  RecommendedTasksResponseDto,
} from "./types/matching.types";
