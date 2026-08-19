import { FilePlus2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageContainer } from "@/shared/components/layout/page-layout";

import { ContributionRequestForm } from "./contribution-request-form";
import { replaceContributionRequestSkillRequirements } from "../services/contribution-requests.service";
import { getContributionRequestErrorMessage } from "../constants/contribution-request-copy";
import { useCreateContributionRequestMutation } from "../api/mutations/use-contribution-request-mutations";
import { createEmptyContributionRequestForm } from "../utils/contribution-request-form";
import { ContributionRequestIdempotencyKeyStore } from "../utils/idempotency-key";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestDto,
  ContributionRequestSkillRequirementInput,
} from "../types/contribution-request.types";

export function ContributionRequestCreateView({
  projectId,
  projectTitle,
  cancelHref,
  presentation = "page",
  onCancel,
  onCreated,
}: {
  projectId: string;
  projectTitle: string;
  cancelHref: string;
  presentation?: "page" | "panel";
  onCancel?: () => void;
  onCreated: (request: ContributionRequestDto) => void;
}) {
  const { t } = useTranslation();
  const mutation = useCreateContributionRequestMutation();
  const idempotency = useRef(new ContributionRequestIdempotencyKeyStore());
  const [error, setError] = useState<string | null>(null);

  async function create(
    payload: ContributionRequestDraftPayload,
    skillRequirements?: ContributionRequestSkillRequirementInput[],
  ) {
    setError(null);
    const idempotencyKey = idempotency.current.getFor({ projectId, payload });
    try {
      const request = await mutation.mutateAsync({
        projectId,
        payload,
        idempotencyKey,
      });
      if (skillRequirements && skillRequirements.length > 0) {
        try {
          await replaceContributionRequestSkillRequirements(
            request.id,
            skillRequirements,
          );
        } catch {
          // Non-blocking fallback
        }
      }
      idempotency.current.clear();
      onCreated(request);
    } catch (requestError) {
      setError(getContributionRequestErrorMessage(requestError));
    }
  }

  const form = (
    <div className="space-y-6">
      {presentation === "page" && (
        <div className="flex flex-col gap-2 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <FilePlus2 className="size-6 stroke-[2.2]" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {t("contributionRequests.create.title")}
                </h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {projectTitle}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {t("contributionRequests.create.description", { project: projectTitle })}
              </p>
            </div>
          </div>
        </div>
      )}

      <ContributionRequestForm
        initialState={createEmptyContributionRequestForm()}
        isSubmitting={mutation.isPending}
        submitError={error}
        submitLabel={t("contributionRequests.create.saveDraft")}
        cancelHref={cancelHref}
        presentation={presentation}
        onCancel={onCancel}
        onSubmit={create}
      />
    </div>
  );

  return presentation === "page" ? (
    <PageContainer className="max-w-7xl px-4 py-6 md:px-6 md:py-8">{form}</PageContainer>
  ) : (
    form
  );
}
