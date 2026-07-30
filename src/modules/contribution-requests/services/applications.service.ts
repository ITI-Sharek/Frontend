import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  ApplicationDto,
  DeclineApplicationParams,
  SubmitApplicationParams,
} from "../types/application.types";
import type { AcceptApplicationResultDto } from "../types/assignment.types";

/**
 * Application and Owner Decision contracts
 * (`docs/architecture/contracts/api-contract-additions.md` §5). Submission
 * enters `PENDING_OWNER_REVIEW` immediately; no AI call or contributor-attempt
 * quota is involved on this seam.
 */

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

export async function getApplication(
  applicationId: string,
): Promise<ApplicationDto> {
  const { data } = await axiosInstance.get<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}`,
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

/** Every `PENDING_OWNER_REVIEW` Application for one Contribution Request. */
export async function getOwnerApplications(
  contributionRequestId: string,
): Promise<ApplicationDto[]> {
  const { data } = await axiosInstance.get<{ applications: ApplicationDto[] }>(
    `/tasks/${encodeURIComponent(contributionRequestId)}/applications`,
  );
  return data.applications;
}

/** Explicit human Owner Decision: acceptance creates an Assignment. */
export async function acceptApplication(
  applicationId: string,
): Promise<AcceptApplicationResultDto> {
  const { data } = await axiosInstance.post<AcceptApplicationResultDto>(
    `/applications/${encodeURIComponent(applicationId)}/accept`,
  );
  return data;
}

/** Explicit human Owner Decision: decline with an optional reason. */
export async function declineApplication({
  applicationId,
  reason,
}: DeclineApplicationParams): Promise<ApplicationDto> {
  const { data } = await axiosInstance.post<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}/decline`,
    reason !== undefined ? { reason } : {},
  );
  return data;
}
