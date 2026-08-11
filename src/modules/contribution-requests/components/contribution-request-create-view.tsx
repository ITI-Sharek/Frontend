import { FilePlus2 } from "lucide-react";
import { useRef, useState } from "react";

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
          title="إنشاء طلب مساهمة"
          description={`أنشئ مسودة خاصة داخل مشروع «${projectTitle}». بعد حفظ المسودة يمكنك مراجعتها ثم نشرها للمساهمين بإجراء منفصل.`}
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
            <h2 className="font-bold text-foreground">تفاصيل المسودة</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              المالك والمشروع يُحددان من جلسة الدخول ولا يُرسلان كحقول قابلة
              للتعديل.
            </p>
          </div>
        </div>
        <ContributionRequestForm
          initialState={createEmptyContributionRequestForm()}
          isSubmitting={mutation.isPending}
          submitError={error}
          submitLabel="حفظ المسودة"
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
