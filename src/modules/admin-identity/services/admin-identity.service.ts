import { axiosInstance } from "@/lib/axios/axios-instance";
import type {
  AdminIdentityVerificationPageDto,
  ListIdentityVerificationsParams,
  ReviewIdentityVerificationPayload,
} from "../types/admin-identity.types";
import type { AuthUserDto } from "@/modules/auth";

export async function listAdminIdentityVerifications(
  params: ListIdentityVerificationsParams = {},
): Promise<AdminIdentityVerificationPageDto> {
  const { data } = await axiosInstance.get<AdminIdentityVerificationPageDto>(
    "/admin/identity-verifications",
    { params },
  );
  return data;
}

export async function reviewAdminIdentityVerification(
  userId: string,
  payload: ReviewIdentityVerificationPayload,
): Promise<{ message: string; user: AuthUserDto }> {
  const { data } = await axiosInstance.patch<{ message: string; user: AuthUserDto }>(
    `/admin/identity-verifications/${userId}`,
    payload,
  );
  return data;
}

export async function getAdminIdentityDocumentBlob(
  userId: string,
): Promise<{ blob: Blob; mimeType: string; filename: string }> {
  const response = await axiosInstance.get(
    `/admin/identity-verifications/${encodeURIComponent(userId)}/document`,
    {
      responseType: "blob",
    },
  );
  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  let filename = "identity-document";
  if (contentDisposition) {
    const match = /filename="([^"]*)"/.exec(contentDisposition);
    if (match && match[1]) {
      try {
        filename = decodeURIComponent(match[1]) || "identity-document";
      } catch {
        filename = match[1];
      }
    }
  }
  return {
    blob: response.data as Blob,
    mimeType: (response.headers["content-type"] as string) || "application/pdf",
    filename,
  };
}
