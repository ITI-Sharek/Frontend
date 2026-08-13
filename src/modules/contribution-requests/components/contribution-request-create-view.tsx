import { FilePlus2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "@/shared/components/ui/card";
import {
  PageContainer,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import { ContributionRequestForm } from "./contribution-request-form";
import { getContributionRequestErrorMessage } from "../constants/contribution-request-copy";
import { useCreateContributionRequestMutation } from "../api/mutations/use-contribution-request-mutations";
import { createEmptyContributionRequestForm } from "../utils/contribution-request-form";
import { ContributionRequestIdempotencyKeyStore } from "../utils/idempotency-key";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestDto,
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

  async function create(payload: ContributionRequestDraftPayload) {
    setError(null);
    const idempotencyKey = idempotency.current.getFor({ projectId, payload });
    try {
      const request = await mutation.mutateAsync({
        projectId,
        payload,
        idempotencyKey,
      });
      idempotency.current.clear();
      onCreated(request);
    } catch (requestError) {
      setError(getContributionRequestErrorMessage(requestError));
    }
  }

  const form = (
    <>
      {presentation === "page" && (
        <PageHeader
          title={t("contributionRequests.create.title")}
          description={t("contributionRequests.create.description", { project: projectTitle })}
        />
      )}
      <Card
        className={
          presentation === "page" ? "mt-6" : "border-0 bg-transparent p-0"
        }
      >
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilePlus2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold text-foreground">{t("contributionRequests.create.draftDetails")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("contributionRequests.create.ownerProjectNotice")}
            </p>
          </div>
        </div>
        <ContributionRequestForm
          initialState={createEmptyContributionRequestForm()}
          isSubmitting={mutation.isPending}
          submitError={error}
          submitLabel={t("contributionRequests.create.saveDraft")}
          cancelHref={cancelHref}
          onCancel={onCancel}
          onSubmit={create}
        />
      </Card>
    </>
  );

  return presentation === "page" ? (
    <PageContainer className="max-w-4xl">{form}</PageContainer>
  ) : (
    form
  );
}
