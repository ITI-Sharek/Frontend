import { axiosInstance } from "@/lib/axios/axios-instance";
import { getApiErrorCode } from "@/shared/utils/get-api-error-code";

import type {
  RetrySkillProfileGenerationPayload,
  SkillProfileGenerationDto,
  StartSkillProfileGenerationPayload,
} from "../types/skill-profile-generation.types";

/**
 * Called only after the contributor explicitly presses Start. Connecting an
 * installation or browsing repositories must never reach this endpoint.
 */
export async function startSkillProfileGeneration(
  payload: StartSkillProfileGenerationPayload,
): Promise<SkillProfileGenerationDto> {
  const { data } = await axiosInstance.post<SkillProfileGenerationDto>(
    "/skill-profiles/me/generations",
    payload,
  );
  return data;
}

export async function getSkillProfileGeneration(
  generationId: string,
): Promise<SkillProfileGenerationDto> {
  const { data } = await axiosInstance.get<SkillProfileGenerationDto>(
    `/skill-profiles/me/generations/${generationId}`,
  );
  return data;
}

/**
 * Reload recovery. The backend answers 404 `SKILL_PROFILE_GENERATION_NOT_FOUND`
 * when the contributor has never generated, which is a normal empty state
 * rather than an error.
 */
export async function getLatestSkillProfileGeneration(): Promise<SkillProfileGenerationDto | null> {
  try {
    const { data } = await axiosInstance.get<SkillProfileGenerationDto>(
      "/skill-profiles/me/generations/latest",
    );
    return data;
  } catch (error) {
    if (getApiErrorCode(error) === "SKILL_PROFILE_GENERATION_NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

/** Retry always requires fresh explicit consent; the backend reuses selection. */
export async function retrySkillProfileGeneration({
  generationId,
  consent,
}: RetrySkillProfileGenerationPayload): Promise<SkillProfileGenerationDto> {
  const { data } = await axiosInstance.post<SkillProfileGenerationDto>(
    `/skill-profiles/me/generations/${generationId}/retry`,
    { consent },
  );
  return data;
}
