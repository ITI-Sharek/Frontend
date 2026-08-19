export interface AdminIdentityVerificationItemDto {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
  identityVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  identityDocumentMimeType: string | null;
  identityDocumentUpdatedAt: string | null;
  identityVerifiedAt: string | null;
  identityVerificationRejectedReason: string | null;
  identityVerifiedBy: string | null;
  createdAt: string;
}

export interface AdminIdentityVerificationPageDto {
  items: AdminIdentityVerificationItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListIdentityVerificationsParams {
  page?: number;
  limit?: number;
  status?: "all" | "pending" | "verified" | "rejected" | "unverified";
}

export interface ReviewIdentityVerificationPayload {
  decision: "verified" | "rejected";
  reason?: string;
}
