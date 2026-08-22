import type { Globe } from "lucide-react";
import { z } from "zod";

import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../types/project.types";

export const HERO_IMAGE_ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const HERO_IMAGE_MAX_BYTES = 5_000_000;

export const materialVisibilitySchema = z.enum([
  "PUBLIC",
  "RESTRICTED_PROJECT",
]);

export const queuedMaterialSchema = z.object({
  id: z.string(),
  file: z.instanceof(File),
  title: z.string(),
  visibility: materialVisibilitySchema,
});

export const suggestedRepositorySchema = z.object({
  fullName: z.string(),
  description: z.string().nullable(),
  isPrivate: z.boolean(),
});

export const publishedProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
});

export type QueuedMaterial = z.infer<typeof queuedMaterialSchema>;
export type MaterialVisibility = z.infer<typeof materialVisibilitySchema>;
export type SuggestedRepository = z.infer<typeof suggestedRepositorySchema>;
export type PublishedProject = z.infer<typeof publishedProjectSchema>;

export interface DynamicCategoryItem {
  id: ProjectCategory | string;
  label: string;
  icon?: typeof Globe;
}

export interface DynamicDifficultyItem {
  id: ProjectDifficulty | string;
  label: string;
}

export interface ImportProjectStepperProps {
  onDraftCreated: (projectId: string) => void;
  onProjectPublished?: (projectId: string, projectSlug: string) => void;
  onUploadMaterials?: (
    projectId: string,
    materials: QueuedMaterial[],
  ) => Promise<void>;
  suggestedRepositories?: SuggestedRepository[];
  suggestedRepositoriesLoading?: boolean;
  suggestedRepositoriesError?: string | null;
  needsGitHubConnection?: boolean;
  onConnectGitHub?: () => void;
  categories?: DynamicCategoryItem[];
  technologies?: string[];
  difficulties?: DynamicDifficultyItem[];
}
