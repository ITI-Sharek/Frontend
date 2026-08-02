import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  AcceptApplicationParams,
  ApplicationDto,
  DecisionFeedbackReportDto,
  DeclineApplicationParams,
  OwnerApplicationsDto,
  ReportDecisionFeedbackParams,
  SubmitApplicationParams,
} from "../types/application.types";
import type {
  AdvisoryFitAssessmentDto,
  RequestAdvisoryFitParams,
} from "../types/advisory-fit.types";
import type { OwnerDecisionResultDto } from "../types/assignment.types";

export async function submitApplication(
  contributionRequestId: string,
  params: SubmitApplicationParams,
): Promise<ApplicationDto> {
  const { data } = await axiosInstance.post<ApplicationDto>(
    `/tasks/${encodeURIComponent(contributionRequestId)}/applications`,
    params,
  );
  return data;
}

/** Every pending Application for one owned Contribution Request, oldest first. */
export async function getOwnerApplications(
  contributionRequestId: string,
): Promise<ApplicationDto[]> {
  const { data } = await axiosInstance.get<OwnerApplicationsDto>(
    `/tasks/${encodeURIComponent(contributionRequestId)}/applications`,
  );
  return data.applications;
}

/** Contextually authorized for the applying contributor or current Project owner. */
export async function getApplication(
  applicationId: string,
): Promise<ApplicationDto> {
  const { data } = await axiosInstance.get<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}`,
  );
  return data;
}

/** Explicit owner action; assessment remains optional and decision-neutral. */
export async function requestAdvisoryFit({
  applicationId,
  idempotencyKey,
}: RequestAdvisoryFitParams): Promise<AdvisoryFitAssessmentDto> {
  const { data } = await axiosInstance.post<AdvisoryFitAssessmentDto>(
    `/applications/${encodeURIComponent(applicationId)}/assessment-requests`,
    { idempotencyKey },
  );
  return data;
}

/** Owner-only assessment presentation; the backend records first presentation. */
export async function getAdvisoryFit(
  applicationId: string,
): Promise<AdvisoryFitAssessmentDto> {
  const { data } = await axiosInstance.get<AdvisoryFitAssessmentDto>(
    `/applications/${encodeURIComponent(applicationId)}/assessment`,
  );
  return data;
}

export async function withdrawApplication(
  applicationId: string,
  idempotencyKey: string,
): Promise<ApplicationDto> {
  const { data } = await axiosInstance.post<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}/withdraw`,
    undefined,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

/** Explicit human acceptance; assessment is not an input or prerequisite. */
export async function acceptApplication({
  applicationId,
  idempotencyKey,
}: AcceptApplicationParams): Promise<OwnerDecisionResultDto> {
  const { data } = await axiosInstance.post<OwnerDecisionResultDto>(
    `/applications/${encodeURIComponent(applicationId)}/accept`,
    undefined,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

/** Explicit human decline feedback, kept separate from any AI finding. */
export async function declineApplication({
  applicationId,
  feedback,
  idempotencyKey,
}: DeclineApplicationParams): Promise<OwnerDecisionResultDto> {
  const { data } = await axiosInstance.post<OwnerDecisionResultDto>(
    `/applications/${encodeURIComponent(applicationId)}/decline`,
    { feedback },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data;
}

/** Moderation report only: this never reopens or changes the Application. */
export async function reportDecisionFeedback({
  ownerDecisionId,
  reason,
  description,
}: ReportDecisionFeedbackParams): Promise<DecisionFeedbackReportDto> {
  const { data } = await axiosInstance.post<DecisionFeedbackReportDto>(
    `/owner-decisions/${encodeURIComponent(ownerDecisionId)}/reports`,
    { reason, description },
  );
  return data;
}
