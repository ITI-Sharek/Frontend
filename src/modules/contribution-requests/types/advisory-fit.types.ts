export type AssessmentRequestStatus =
  | "NOT_REQUESTED"
  | "REQUESTED"
  | "COMPLETED"
  | "NOT_STARTED_SYSTEM_LIMIT"
  | "NOT_STARTED_NO_ASSESSABLE_EVIDENCE"
  | "CANCELLED_NOT_NEEDED"
  | "UNAVAILABLE";

export type AssessmentFitBand =
  | "STRONG"
  | "PARTIAL"
  | "LIMITED"
  | "UNKNOWN"
  | "UNAVAILABLE";

export type AdvisoryFitFindingKind =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "NOT_EVIDENCED"
  | "INCONCLUSIVE";

export type AdvisoryFitConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AdvisoryFitFindingDto {
  requirementId: string;
  requirementKind: "REQUIRED" | "PREFERRED";
  finding: AdvisoryFitFindingKind;
  confidence: AdvisoryFitConfidence;
  citations: string[];
  uncertainty: string[];
  explanation: string;
}

export interface AdvisoryFitAssessmentDto {
  id: string | null;
  applicationId: string;
  requestStatus: AssessmentRequestStatus;
  fitBand: AssessmentFitBand | null;
  findings: AdvisoryFitFindingDto[];
  presentedAt: string | null;
  requestedAt: string | null;
  completedAt: string | null;
  attempts: number;
}

export interface RequestAdvisoryFitParams {
  applicationId: string;
  idempotencyKey: string;
}
