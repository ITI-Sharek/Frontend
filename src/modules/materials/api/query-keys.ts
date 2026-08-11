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
  analysisConstraints: (projectId: string) =>
    [...MATERIALS_ROOT, "analysis-constraints", projectId] as const,
  analysisSets: (projectId: string) =>
    [...MATERIALS_ROOT, "analysis-sets", projectId] as const,
  analysisRuns: () => [...MATERIALS_ROOT, "analysis-run"] as const,
  analysisRun: (runId: string) => [...MATERIALS_ROOT, "analysis-run", runId] as const,
};
