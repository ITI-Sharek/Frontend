import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  ImportedProjectDto,
  ImportGitHubProjectPayload,
} from "../types/project.types";

export async function importGitHubProject(
  payload: ImportGitHubProjectPayload,
): Promise<ImportedProjectDto> {
  const { data } = await axiosInstance.post<ImportedProjectDto>(
    "/projects/import/github",
    payload,
  );
  return data;
}
