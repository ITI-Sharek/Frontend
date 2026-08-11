export type DeliveryStatus =
  | "SUBMITTED"
  | "CHANGES_REQUESTED"
  | "RESUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type DeliveryLifecycleStatus =
  | "PENDING_OWNER_REVIEW"
  | "DECLINED_BY_OWNER"
  | "NOT_SELECTED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "REQUEST_CANCELLED"
  | "AWAITING_DELIVERY"
  | "DELIVERY_SUBMITTED"
  | "CHANGES_REQUESTED"
  | "DELIVERY_REJECTED"
  | "COMPLETED";

export interface DeliveryDto {
  id: string;
  applicationId: string;
  contributionRequestId: string;
  contributorId: string;
  pullRequestUrl: string;
  contributorNotes: string | null;
  status: DeliveryStatus;
  submittedAt: string;
  reviewedAt: string | null;
  submissionNumber: number;
}

export interface DeliveryContributorDto {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
}

export interface DeliveryDetailDto extends DeliveryDto {
  contributor: DeliveryContributorDto;
  submissions: Array<{
    submissionNumber: number;
    pullRequestUrl: string;
    contributorNotes: string | null;
    submittedAt: string;
  }>;
  reviews: Array<{
    id: string;
    submissionNumber: number;
    reviewerId: string;
    outcome: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
    rating: number | null;
    feedback: string | null;
    createdAt: string;
  }>;
}

export interface DeliveryLifecycleDto {
  contributions: Array<{
    applicationId: string;
    contributionRequestId: string;
    contributionRequestTitle: string;
    contributor: DeliveryContributorDto;
    applicationStatus:
      | "PENDING_OWNER_REVIEW"
      | "ACCEPTED"
      | "DECLINED_BY_OWNER"
      | "NOT_SELECTED"
      | "EXPIRED"
      | "WITHDRAWN"
      | "REQUEST_CANCELLED";
    deliveryDueAt: string | null;
    assignedAt: string | null;
    lifecycleStatus: DeliveryLifecycleStatus;
    deliveryStatus: "NOT_STARTED" | DeliveryStatus | null;
    delivery: DeliveryDto | null;
  }>;
}

export interface OwnerDeliveryReviewQueueDto {
  deliveries: Array<
    DeliveryDto & {
      contributor: DeliveryContributorDto;
      contributionRequest: {
        id: string;
        title: string;
        requirements: Array<{
          kind: string;
          position: number;
          text: string;
        }>;
      };
    }
  >;
}

export interface SubmitDeliveryCommand {
  pullRequestUrl: string;
  contributorNotes?: string;
  idempotencyKey: string;
}

export interface ReviewDeliveryCommand {
  outcome: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED";
  rating?: number;
  feedback?: string;
  idempotencyKey: string;
}

export interface DeliveryClient {
  getContributorLifecycle: () => Promise<DeliveryLifecycleDto>;
  getOwnerLifecycle: () => Promise<DeliveryLifecycleDto>;
  getOwnerReviewQueue: () => Promise<OwnerDeliveryReviewQueueDto>;
  getDelivery: (deliveryId: string) => Promise<DeliveryDetailDto>;
  submitDelivery: (
    applicationId: string,
    command: SubmitDeliveryCommand,
  ) => Promise<DeliveryDto>;
  updateDelivery: (
    deliveryId: string,
    command: SubmitDeliveryCommand,
  ) => Promise<DeliveryDto>;
  reviewDelivery: (
    deliveryId: string,
    command: ReviewDeliveryCommand,
  ) => Promise<DeliveryDto>;
}
