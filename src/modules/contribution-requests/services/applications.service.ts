import { axiosInstance } from "@/lib/axios/axios-instance";

import type {
  ApplicationDto,
  ApplicationStatus,
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

export async function getMyApplications(
  status?: ApplicationStatus,
): Promise<ApplicationDto[]> {
  const { data } = await axiosInstance.get<ApplicationDto[]>(
    "/me/applications",
    { params: status !== undefined ? { status } : undefined },
  );
  return data;
}

export async function withdrawApplication(
  applicationId: string,
): Promise<ApplicationDto> {
  const { data } = await axiosInstance.post<ApplicationDto>(
    `/applications/${encodeURIComponent(applicationId)}/withdraw`,
  );
  return data;
}

/** Every `PENDING_OWNER_REVIEW` Application for one Contribution Request. */
export async function getOwnerApplications(
  contributionRequestId: string,
): Promise<ApplicationDto[]> {
  const { data } = await axiosInstance.get<ApplicationDto[]>(
    `/tasks/${encodeURIComponent(contributionRequestId)}/applications`,
  );
  return data;
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
