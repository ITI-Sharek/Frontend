import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  SkillProfileGenerationDto,
  StartSkillProfileGenerationPayload,
} from "../types/skill-profile-generation.types";

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
