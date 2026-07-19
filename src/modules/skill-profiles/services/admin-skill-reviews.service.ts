import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AdjustSkillReviewProficiencyPayload,
  ApproveSkillReviewPayload,
  PendingSkillReviewsDto,
  RejectSkillReviewPayload,
  SkillProfileReviewResultDto,
} from "../types/admin-skill-review.types";

export async function listPendingSkillReviews({
  page = 1,
  limit = 20,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<PendingSkillReviewsDto> {
  const { data } = await axiosInstance.get<PendingSkillReviewsDto>(
    "/admin/skill-reviews/pending",
    { params: { page, limit } },
  );
  return data;
}

export async function approveSkillReview(
  skillProfileId: string,
  payload: ApproveSkillReviewPayload = {},
): Promise<SkillProfileReviewResultDto> {
  const { data } = await axiosInstance.post<SkillProfileReviewResultDto>(
    `/admin/skill-reviews/${encodeURIComponent(skillProfileId)}/approve`,
    payload,
  );
  return data;
}

export async function rejectSkillReview(
  skillProfileId: string,
  payload: RejectSkillReviewPayload,
): Promise<SkillProfileReviewResultDto> {
  const { data } = await axiosInstance.post<SkillProfileReviewResultDto>(
    `/admin/skill-reviews/${encodeURIComponent(skillProfileId)}/reject`,
    payload,
  );
  return data;
}

export async function adjustSkillReviewProficiency(
  skillProfileId: string,
  payload: AdjustSkillReviewProficiencyPayload,
): Promise<SkillProfileReviewResultDto> {
  const { data } = await axiosInstance.patch<SkillProfileReviewResultDto>(
    `/admin/skill-reviews/${encodeURIComponent(skillProfileId)}/proficiency`,
    payload,
  );
  return data;
}
