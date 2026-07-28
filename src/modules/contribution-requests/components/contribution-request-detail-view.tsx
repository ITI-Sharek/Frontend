import { CircleAlert, FileText, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import { ContributionRequestForm } from "./contribution-request-form";
import { DiscardContributionRequestDialog } from "./discard-contribution-request-dialog";
import {
  getContributionRequestErrorMessage,
  isContributionRequestError,
} from "../constants/contribution-request-copy";
import {
  useDiscardContributionRequestMutation,
  useUpdateContributionRequestMutation,
} from "../api/mutations/use-contribution-request-mutations";
import { useContributionRequestQuery } from "../api/queries/use-contribution-request-query";
import { toContributionRequestForm } from "../utils/contribution-request-form";
import { ContributionRequestIdempotencyKeyStore } from "../utils/idempotency-key";
import type { ContributionRequestDraftPayload } from "../types/contribution-request.types";

export function ContributionRequestDetailView({
  requestId,
  projectHref,
}: {
  requestId: string;
  projectHref: (projectId: string) => string;
}) {
  const query = useContributionRequestQuery(requestId);
  const updateMutation = useUpdateContributionRequestMutation(requestId);
  const discardMutation = useDiscardContributionRequestMutation(requestId);
  const updateIdempotency = useRef(new ContributionRequestIdempotencyKeyStore());
  const discardIdempotency = useRef(new ContributionRequestIdempotencyKeyStore());
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  if (query.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          icon={Loader2}
          title="جارٍ تحميل طلب المساهمة"
          description="نسترجع أحدث نسخة يملكها هذا الحساب."
        />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر فتح طلب المساهمة"
          description={getContributionRequestErrorMessage(query.error)}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => void query.refetch()}>
                إعادة المحاولة
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/my-projects">العودة إلى مشاريعي</a>
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const request = query.data;
  const editable = request.status === "draft";
  const statusMeta =
    request.status === "discarded"
      ? { tone: "negative" as const, icon: Trash2, label: "تم التجاهل" }
      : request.status === "draft"
        ? { tone: "neutral" as const, icon: FileText, label: "مسودة" }
        : {
            tone: "attention" as const,
            icon: CircleAlert,
            label: "غير قابل للتعديل",
          };

  async function update(payload: ContributionRequestDraftPayload) {
    setSaved(false);
    setUpdateError(null);
    const idempotencyKey = updateIdempotency.current.getFor({ requestId, payload });
    try {
      await updateMutation.mutateAsync({ payload, idempotencyKey });
      updateIdempotency.current.clear();
      setSaved(true);
    } catch (error) {
      if (isContributionRequestError(error, "CONTRIBUTION_REQUEST_CONCURRENT_MODIFICATION")) {
        await query.refetch();
      }
      setUpdateError(getContributionRequestErrorMessage(error));
    }
  }

  async function discard(reason: string) {
    setDiscardError(null);
    const payload = reason ? { reason } : {};
    const idempotencyKey = discardIdempotency.current.getFor({ requestId, payload });
    try {
      await discardMutation.mutateAsync({ payload, idempotencyKey });
      discardIdempotency.current.clear();
      setDiscardOpen(false);
      document.getElementById("discard-request-trigger")?.focus();
    } catch (error) {
      setDiscardError(getContributionRequestErrorMessage(error));
    }
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={request.title}
        description="مسودة طلب مساهمة خاصة بصاحب المشروع. النشر والاكتشاف العام غير متاحين في هذه المرحلة."
        actions={
          <StatusChip
            tone={statusMeta.tone}
            icon={statusMeta.icon}
          >
            {statusMeta.label}
          </StatusChip>
        }
      />

      {request.status === "discarded" ? (
        <Card className="mt-6 border-destructive/25 bg-destructive/5">
          <h2 className="text-lg font-bold text-foreground">مسودة متجاهلة — للعرض فقط</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            تم إنهاء هذه المسودة دون حذف سجلها. لا يمكن تعديلها أو إعادتها من هذه الواجهة.
          </p>
          <ReadOnlyRequest request={request} />
          <Button asChild variant="outline" className="mt-5">
            <a href={projectHref(request.projectId)}>العودة إلى المشروع</a>
          </Button>
        </Card>
      ) : editable ? (
        <Card className="mt-6">
          {saved && (
            <p role="status" aria-live="polite" className="mb-4 text-sm text-evidence-teal">
              حُفظت أحدث تغييرات المسودة.
            </p>
          )}
          <ContributionRequestForm
            key={request.updatedAt}
            initialState={toContributionRequestForm(request)}
            isSubmitting={updateMutation.isPending}
            submitError={updateError}
            submitLabel="حفظ التغييرات"
            cancelHref={projectHref(request.projectId)}
            onSubmit={update}
          />
          <div className="mt-6 border-t border-destructive/25 pt-5">
            <h2 className="font-bold text-foreground">إنهاء المسودة</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              التجاهل نهائي ولا يحذف السجل أو يحوله إلى إلغاء منشور.
            </p>
            <Button
              id="discard-request-trigger"
              type="button"
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={() => {
                setDiscardError(null);
                setDiscardOpen(true);
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              تجاهل المسودة
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-bold text-foreground">طلب غير قابل للتعديل</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            حالة هذا السجل ليست مسودة. لا تعرض واجهة #48 إجراءات نشر أو إلغاء أو تقديم.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <a href={projectHref(request.projectId)}>العودة إلى المشروع</a>
          </Button>
        </Card>
      )}

      <DiscardContributionRequestDialog
        isOpen={discardOpen}
        isDiscarding={discardMutation.isPending}
        error={discardError}
        onCancel={() => {
          setDiscardOpen(false);
          document.getElementById("discard-request-trigger")?.focus();
        }}
        onConfirm={discard}
      />
    </PageContainer>
  );
}

function ReadOnlyRequest({
  request,
}: {
  request: NonNullable<ReturnType<typeof useContributionRequestQuery>["data"]>;
}) {
  return (
    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
      <ReadOnlyField label="الوصف" value={request.description} className="sm:col-span-2" />
      <ReadOnlyField
        label="المتطلبات المطلوبة"
        value={request.requiredRequirements.map((item) => item.text).join("، ")}
      />
      <ReadOnlyField
        label="المتطلبات المفضلة"
        value={request.preferredRequirements.map((item) => item.text).join("، ") || "—"}
      />
      <ReadOnlyField label="وقت إغلاق التقديم" value={request.applicationsCloseTime ?? "—"} />
      <ReadOnlyField label="تاريخ الإنجاز المستهدف" value={request.targetCompletionDate ?? "—"} />
    </dl>
  );
}

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 leading-6 text-foreground">{value}</dd>
    </div>
  );
}
