import { axiosInstance } from "@/lib/axios/axios-instance";

import type { SkillGapGuidanceResultDto } from "../types/skill-guidance.types";

export async function requestSkillGapGuidance(
  contributionRequestId: string,
): Promise<SkillGapGuidanceResultDto> {
  const { data } = await axiosInstance.post<SkillGapGuidanceResultDto>(
    "/contributors/me/skill-gap-guidance",
    { contributionRequestId },
  );
  return data;
}
