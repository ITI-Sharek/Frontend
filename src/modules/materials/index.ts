export { MaterialsPanel } from "./components/materials-panel";
export { MaterialUploadForm } from "./components/material-upload-form";
export { MaterialCard } from "./components/material-card";
export { MaterialGrantsPanel } from "./components/material-grants-panel";
export { MaterialVersionRow } from "./components/material-version-row";
export { MaterialAnalysisPanel } from "./components/material-analysis-panel";

export {
  useProjectMaterialsQuery,
  useContributionRequestMaterialsQuery,
  useMaterialGrantsQuery,
  useMaterialUploadConstraintsQuery,
  materialsRefetchInterval,
  useMaterialAnalysisConstraintsQuery,
  useMaterialAnalysisSetsQuery,
  useMaterialAnalysisRunQuery,
} from "./api/queries/use-material-queries";
export {
  useCreateMaterialAnalysisSetMutation,
  useStartMaterialAnalysisRunMutation,
  useRejectMaterialDraftSuggestionMutation,
  useAdoptProjectMaterialSuggestionMutation,
  useAdoptContributionRequestMaterialSuggestionMutation,
} from "./api/mutations/use-material-analysis-mutations";
export { materialKeys } from "./api/query-keys";
export type { MaterialScope } from "./api/mutations/use-material-mutations";

export {
  canDownloadVersion,
  getMaterialVersionState,
  getMaterialStateMeta,
  getVisibilityCopy,
} from "./utils/material-state";
export type { MaterialVersionState } from "./utils/material-state";

export type {
  MaterialDto,
  MaterialGrantDto,
  MaterialVersionDto,
  MaterialVisibility,
} from "./types/material.types";
