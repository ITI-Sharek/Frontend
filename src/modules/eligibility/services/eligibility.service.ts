import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  EligibilityGuidanceDto,
  EligibilityPreviewDto,
} from "../types/eligibility.types";

export async function getContributionRequestEligibility(
  contributionRequestId: string,
): Promise<EligibilityPreviewDto> {
  const { data } = await axiosInstance.get<EligibilityPreviewDto>(
    `/tasks/${contributionRequestId}/eligibility`,
  );
  return data;
}

export async function requestEligibilityGuidance(
  eligibilityEvaluationId: string,
): Promise<EligibilityGuidanceDto> {
  const { data } = await axiosInstance.post<EligibilityGuidanceDto>(
    "/contributors/me/eligibility-guidance",
    { eligibilityEvaluationId },
  );
  return data;
}

export async function getEligibilityGuidance(
  guidanceId: string,
): Promise<EligibilityGuidanceDto> {
  const { data } = await axiosInstance.get<EligibilityGuidanceDto>(
    `/contributors/me/eligibility-guidance/${guidanceId}`,
  );
  return data;
}
