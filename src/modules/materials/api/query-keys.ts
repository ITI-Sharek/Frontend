const MATERIALS_ROOT = ["materials"] as const;

export const materialKeys = {
  all: MATERIALS_ROOT,
  uploadConstraints: () => [...MATERIALS_ROOT, "upload-constraints"] as const,
  projectList: (projectId: string) =>
    [...MATERIALS_ROOT, "project-list", projectId] as const,
  contributionRequestList: (requestId: string) =>
    [...MATERIALS_ROOT, "contribution-request-list", requestId] as const,
  grants: (materialId: string) =>
    [...MATERIALS_ROOT, "grants", materialId] as const,
};
