import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import i18n from "@/lib/i18n";
import { requireContributorRoute } from "@/modules/auth";
import {
  getProposalErrorMessage,
  ProposalSubmissionView,
  useSubmitContributionProposalMutation,
} from "@/modules/contribution-proposals";
import type { ContributionProposalFields } from "@/modules/contribution-proposals";
import {
  EligibilityBlockPanel,
  readBlockingSkills,
} from "@/modules/eligibility";
import type { BlockingSkillDto } from "@/modules/eligibility";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

function validateProposalSearch(search: Record<string, unknown>) {
  return {
    projectId: typeof search.projectId === "string" ? search.projectId : "",
    // Carried from the project page the contributor just came from. The
    // proposal intake endpoint is owner-only, so this page cannot look the
    // name up for itself; when it is absent the project line is omitted
    // rather than falling back to showing a UUID at someone.
    projectName: typeof search.projectName === "string" ? search.projectName : "",
  };
}

export const Route = createFileRoute("/_appLayout/proposals/new")({
  beforeLoad: requireContributorRoute,
  validateSearch: validateProposalSearch,
  head: () => ({ meta: [{ title: i18n.t("pageTitle.newProposal") }] }),
  component: NewProposalPage,
});

function NewProposalPage() {
  const { t } = useTranslation();
  const { projectId, projectName } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mutation = useSubmitContributionProposalMutation();
  const idempotencyKeys = useRef(new Map<string, string>());
  const [error, setError] = useState<string | null>(null);
  /**
   * Set when the server refuses the proposal on skill grounds. There is no
   * pre-flight on this path — the bar comes from the proposal's own text — so
   * this is the only way a block reaches the screen here.
   */
  const [blockingSkills, setBlockingSkills] = useState<
    BlockingSkillDto[] | null
  >(null);

  if (!projectId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-foreground">{t("proposals.chooseProjectFirst")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("proposals.chooseProjectDescription")}
        </p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-primary" to={ROUTES.publicProjects}>
          {t("proposals.browseProjects")}
        </Link>
      </div>
    );
  }

  async function submit(fields: ContributionProposalFields) {
    setError(null);
    setBlockingSkills(null);
    const fingerprint = JSON.stringify({ projectId, ...fields });
    const existingKey = idempotencyKeys.current.get(fingerprint);
    const idempotencyKey = existingKey ?? createIdempotencyKey();
    idempotencyKeys.current.set(fingerprint, idempotencyKey);
    try {
      const proposal = await mutation.mutateAsync({
        ...fields,
        projectId,
        acknowledgesAttributionAndAssignmentDisclosure: true,
        idempotencyKey,
      });
      await navigate({
        to: "/proposals/$proposalId",
        params: { proposalId: proposal.id },
      });
    } catch (submitError) {
      const skills = readBlockingSkills(submitError);
      if (skills) {
        // The refusal already names every blocking skill, so it becomes the
        // same explanation the task detail shows — not a one-line error the
        // proposer cannot act on.
        setBlockingSkills(skills);
        return;
      }
      setError(getProposalErrorMessage(t, submitError));
    }
  }

  return (
    <ProposalSubmissionView
      projectName={projectName}
      isSubmitting={mutation.isPending}
      error={error}
      onSubmit={submit}
      submissionBlockSlot={
        blockingSkills ? (
          <EligibilityBlockPanel
            blockingSkills={blockingSkills}
            eligibilityEvaluationId={null}
            skillAnalysisHref={`${ROUTES.settings}?section=github`}
          />
        ) : null
      }
    />
  );
}
