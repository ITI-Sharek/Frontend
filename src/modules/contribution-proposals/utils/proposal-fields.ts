import type { ContributionProposalFields } from "../types/contribution-proposal.types";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Narrows any wider proposal-shaped object down to exactly the four canonical
 * editable fields, trimming them and coercing non-strings instead of throwing.
 *
 * Needed because the revision flow seeds the editor from a
 * `ContributionProposalVersionDto`, which also carries `version` (a number),
 * `authoredBy` and `createdAt`. The backend validation pipe runs
 * `whitelist: true, forbidNonWhitelisted: true`, so any extra key that reaches
 * the versions endpoint is a hard 400.
 *
 * The explicit object literal is deliberate: it is structurally checked against
 * `ContributionProposalFields`, so adding a fifth field to that interface
 * becomes a compile error here rather than a silent runtime gap.
 */
export function toProposalFields(
  value: Partial<ContributionProposalFields> | undefined,
): ContributionProposalFields {
  return {
    title: normalizeText(value?.title),
    problemOrOpportunity: normalizeText(value?.problemOrOpportunity),
    proposedOutcome: normalizeText(value?.proposedOutcome),
    projectBenefit: normalizeText(value?.projectBenefit),
  };
}
