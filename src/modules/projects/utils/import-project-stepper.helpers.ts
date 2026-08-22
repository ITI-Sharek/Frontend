import type {
  QueuedMaterial,
  SuggestedRepository,
} from "../schemas/import-project-stepper.schema";

import {
  HERO_IMAGE_ACCEPTED_MIME_TYPES,
  HERO_IMAGE_MAX_BYTES,
} from "../schemas/import-project-stepper.schema";

/** Case-insensitive substring filter over suggested repository full names. */
export function filterSuggestedRepositories(
  repositories: SuggestedRepository[],
  repoSearch: string,
): SuggestedRepository[] {
  const search = repoSearch.toLowerCase();
  return repositories.filter((repo) =>
    repo.fullName.toLowerCase().includes(search),
  );
}

/** PNG/JPEG/WebP up to 5 MB — mirrors the hero-image upload contract. */
export function isHeroImageSelectionValid(file: File): boolean {
  return (
    HERO_IMAGE_ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof HERO_IMAGE_ACCEPTED_MIME_TYPES)[number],
    ) && file.size <= HERO_IMAGE_MAX_BYTES
  );
}

/** Strips the extension and separator characters to seed a material title. */
export function deriveMaterialTitle(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}

/**
 * Converts picked/dropped files into publicly-visible queued materials.
 * `FileList` is structurally an `ArrayLike<File>`, which keeps this testable
 * without a DOM.
 */
export function buildQueuedMaterials(
  files: ArrayLike<File> | null,
): QueuedMaterial[] {
  if (!files || files.length === 0) return [];
  return Array.from(files).map((file) => ({
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    title: deriveMaterialTitle(file.name),
    visibility: "PUBLIC",
  }));
}
