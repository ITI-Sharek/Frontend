export { MaterialsPanel } from "./components/materials-panel";
export { MaterialUploadForm } from "./components/material-upload-form";
export { MaterialCard } from "./components/material-card";
export { MaterialGrantsPanel } from "./components/material-grants-panel";
export { MaterialVersionRow } from "./components/material-version-row";

export {
  useProjectMaterialsQuery,
  useContributionRequestMaterialsQuery,
  useMaterialGrantsQuery,
  useMaterialUploadConstraintsQuery,
  materialsRefetchInterval,
} from "./api/queries/use-material-queries";
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
