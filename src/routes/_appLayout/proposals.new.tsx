import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import {
  getProposalErrorMessage,
  ProposalSubmissionView,
  useSubmitContributionProposalMutation,
} from "@/modules/contribution-proposals";
import type { ContributionProposalFields } from "@/modules/contribution-proposals";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

function validateProposalSearch(search: Record<string, unknown>) {
  return { projectId: typeof search.projectId === "string" ? search.projectId : "" };
}

export const Route = createFileRoute("/_appLayout/proposals/new")({
  beforeLoad: requireContributorRoute,
  validateSearch: validateProposalSearch,
  head: () => ({ meta: [{ title: "إرسال مقترح مساهمة | Sharek" }] }),
  component: NewProposalPage,
});

function NewProposalPage() {
  const { projectId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mutation = useSubmitContributionProposalMutation();
  const idempotencyKeys = useRef(new Map<string, string>());
  const [error, setError] = useState<string | null>(null);

  if (!projectId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-foreground">اختر مشروعًا أولًا</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          يبدأ المقترح من الصفحة العامة لمشروع منشور يقبل المقترحات.
        </p>
        <a className="mt-4 inline-flex text-sm font-semibold text-primary" href={ROUTES.publicProjects}>
          استعراض المشاريع
        </a>
      </div>
    );
  }

  async function submit(fields: ContributionProposalFields) {
    setError(null);
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
      setError(getProposalErrorMessage(submitError));
    }
  }

  return (
    <ProposalSubmissionView
      projectId={projectId}
      isSubmitting={mutation.isPending}
      error={error}
      onSubmit={submit}
    />
  );
}
