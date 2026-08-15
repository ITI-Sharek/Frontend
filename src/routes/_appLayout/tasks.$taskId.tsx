import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute } from "@/modules/auth";
import { ContributorContributionRequestDetailView } from "@/modules/contribution-requests";
import {
  BlockedSubmitAction,
  EligibilityBlockPanel,
  readBlockingSkills,
  readEligibilityEvaluationId,
  useContributionRequestEligibilityQuery,
} from "@/modules/eligibility";
import type { BlockingSkillDto } from "@/modules/eligibility";
import {
  MaterialsPanel,
  useContributionRequestMaterialsQuery,
} from "@/modules/materials";
import { SkillGapGuidancePanel } from "@/modules/skill-guidance";
import {
  DailyApplicationQuotaNotice,
  subscriptionQueryKeys,
} from "@/modules/subscriptions";

export const Route = createFileRoute("/_appLayout/tasks/$taskId")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Sharek" }] }),
  component: ContributionRequestDetailsPage,
});

function ContributionRequestDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = Route.useNavigate();
  const materialsQuery = useContributionRequestMaterialsQuery(taskId);
  const eligibilityQuery = useContributionRequestEligibilityQuery(taskId);
  const queryClient = useQueryClient();

  /**
   * Blocking skills the *server* named when refusing a submit, which only
   * happens when eligibility changed after this page rendered. Held here rather
   * than in the detail view because the explanation belongs to the eligibility
   * module, and modules never import each other.
   */
  const [refusal, setRefusal] = useState<{
    skills: BlockingSkillDto[];
    eligibilityEvaluationId: string | null;
  } | null>(null);

  const previewSkills =
    eligibilityQuery.data?.outcome === "blocked"
      ? eligibilityQuery.data.blockingSkills
      : null;
  // The server's refusal wins over the page's earlier reading of the same
  // question: it is newer, and it is the one that actually decided.
  const blockingSkills = refusal?.skills ?? previewSkills;

  return (
    <ContributorContributionRequestDetailView
      requestId={taskId}
      requestsHref={ROUTES.tasks}
      dashboardHref={ROUTES.dashboard}
      applicationHref={ROUTES.application}
      projectHref={(slug) =>
        `${ROUTES.publicProjects}/${encodeURIComponent(slug)}`
      }
      guidanceSlot={<SkillGapGuidancePanel contributionRequestId={taskId} />}
      applicationQuotaSlot={<DailyApplicationQuotaNotice />}
      isSubmissionBlocked={Boolean(blockingSkills)}
      submissionBlockSlot={
        blockingSkills ? (
          <EligibilityBlockPanel
            blockingSkills={blockingSkills}
            eligibilityEvaluationId={refusal?.eligibilityEvaluationId ?? null}
            skillAnalysisHref={ROUTES.githubSkillAnalysis}
            onRecoveryNavigate={(skills) =>
              void navigate({
                href: ROUTES.githubSkillAnalysis,
                state: { blockingSkills: skills } as never,
              })
            }
          />
        ) : null
      }
      blockedSubmitAction={
        blockingSkills ? (
          <BlockedSubmitAction blockingSkillCount={blockingSkills.length} />
        ) : null
      }
      onBlockedBySkillGap={(error) => {
        const skills = readBlockingSkills(error);
        // A malformed payload leaves this null and the form falls back to its
        // generic error, rather than rendering a half-built explanation.
        if (skills) {
          setRefusal({
            skills,
            eligibilityEvaluationId: readEligibilityEvaluationId(error),
          });
        }
      }}
      onApplicationQuotaChanged={() =>
        void queryClient.invalidateQueries({
          queryKey: subscriptionQueryKeys.status,
        })
      }
      onApplicationSubmitted={(application) =>
        void navigate({
          href: ROUTES.application(application.id),
        })
      }
      materialsSlot={
        <MaterialsPanel
          scope={{ kind: "contribution-request", id: taskId }}
          isOwner={false}
          materials={materialsQuery.data}
          isLoading={materialsQuery.isPending}
          isError={materialsQuery.isError}
        />
      }
    />
  );
}
