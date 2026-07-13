import type {
  ExploreFitHintDto,
  ExploreProjectDto,
  ProjectDifficulty,
} from "./explore.types";

/**
 * Project details contract (WF-04 · screen-inventory §1.3). Mock-first;
 * future endpoint `GET /projects/:projectSlug` (slug per DEC-025).
 */

export interface ProjectTaskSummaryDto {
  id: string;
  title: string;
  requiredTechnologies: string[];
  difficulty: ProjectDifficulty;
  deadlineLabel: string | null;
  rewardLabel: string | null;
  fitHint: ExploreFitHintDto | null;
}

export interface ProjectDetailsDto extends ExploreProjectDto {
  readmeDigest: string;
  ownerDisplayName: string;
  archived: boolean;
  openTasks: ProjectTaskSummaryDto[];
}
