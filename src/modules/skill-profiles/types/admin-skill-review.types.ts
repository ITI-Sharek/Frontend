export type SkillProfileReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disputed"
  | "superseded";

export type SkillProfileReviewProficiency =
  | "beginner"
  | "intermediate"
  | "advanced";

export type SkillProfileReviewDecisionAction =
  | "approve"
  | "reject"
  | "adjust_proficiency";

export interface PendingSkillReviewItemDto {
  skillProfileId: string;
  contributorId: string;
  contributorName: string;
  contributorUsername: string | null;
  generationId: string | null;
  skillName: string;
  proficiencyLevel: SkillProfileReviewProficiency;
  confidence: number;
  status: SkillProfileReviewStatus;
  evidenceSummary: string | null;
  evidenceSources: unknown;
  createdAt: string;
}

export interface PendingSkillReviewsDto {
  items: PendingSkillReviewItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewedSkillProfileDto {
  skillProfileId: string;
  contributorId: string;
  contributorName: string;
  skillName: string;
  proficiencyLevel: SkillProfileReviewProficiency;
  confidence: number;
  status: SkillProfileReviewStatus;
  evidenceSummary: string | null;
  evidenceSources: unknown;
  originalProficiency: SkillProfileReviewProficiency | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface SkillProfileReviewDecisionDto {
  decisionId: string;
  skillProfileId: string;
  reviewerId: string;
  action: SkillProfileReviewDecisionAction;
  previousStatus: SkillProfileReviewStatus;
  newStatus: SkillProfileReviewStatus;
  previousProficiency: SkillProfileReviewProficiency | null;
  newProficiency: SkillProfileReviewProficiency | null;
  notes: string | null;
  createdAt: string;
}

export interface SkillProfileReviewActivationDto {
  userId: string;
  activated: boolean;
  status: "pending" | "active" | "suspended" | "deactivated";
}

export interface SkillProfileReviewNotificationDto {
  notificationId: string;
  created: boolean;
  deliveredRealtime: boolean;
}

export interface SkillProfileReviewResultDto {
  skill: ReviewedSkillProfileDto;
  decision: SkillProfileReviewDecisionDto;
  activation: SkillProfileReviewActivationDto | null;
  notification: SkillProfileReviewNotificationDto | null;
}

export interface ApproveSkillReviewPayload {
  proficiency?: SkillProfileReviewProficiency;
  notes?: string;
}

export interface RejectSkillReviewPayload {
  notes: string;
}

export interface AdjustSkillReviewProficiencyPayload {
  proficiency: SkillProfileReviewProficiency;
  notes?: string;
}
