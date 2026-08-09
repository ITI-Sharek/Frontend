import { CircleAlert, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

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
import { PublishContributionRequestDialog } from "./publish-contribution-request-dialog";
import { CancelContributionRequestDialog } from "./cancel-contribution-request-dialog";
import { OwnerApplicationReview } from "./owner-application-review";
import {
  getContributionRequestErrorMessage,
} from "../constants/contribution-request-copy";
import {
  useCancelContributionRequestMutation,
  useDiscardContributionRequestMutation,
  usePublishContributionRequestMutation,
  useUpdateContributionRequestMutation,
} from "../api/mutations/use-contribution-request-mutations";
import { useContributionRequestQuery } from "../api/queries/use-contribution-request-query";
import { toContributionRequestForm } from "../utils/contribution-request-form";
import { ContributionRequestIdempotencyKeyStore } from "../utils/idempotency-key";
import {
  getOwnerContributionRequestStatusMeta,
  isContributionRequestApplicationsClosed,
} from "../utils/contribution-request-status";
import {
  formatContributionDate,
  formatContributionDateTime,
} from "../utils/contributor-presentation";
import type { ContributionRequestDraftPayload } from "../types/contribution-request.types";

export function ContributionRequestDetailView({
  requestId,
  projectHref,
  materialsSlot,
}: {
  requestId: string;
  projectHref: (projectId: string) => string;
  materialsSlot?: ReactNode;
}) {
  const query = useContributionRequestQuery(requestId);
  const updateMutation = useUpdateContributionRequestMutation(requestId);
  const discardMutation = useDiscardContributionRequestMutation(requestId);
  const publishMutation = usePublishContributionRequestMutation(requestId);
  const cancelMutation = useCancelContributionRequestMutation(requestId);
  const updateIdempotency = useRef(
    new ContributionRequestIdempotencyKeyStore(),
  );
  const discardIdempotency = useRef(
    new ContributionRequestIdempotencyKeyStore(),
  );
  const publishIdempotency = useRef(
    new ContributionRequestIdempotencyKeyStore(),
  );
  const cancelIdempotency = useRef(
    new ContributionRequestIdempotencyKeyStore(),
  );
  const lifecycleFocusRef = useRef<HTMLDivElement>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [focusLifecycle, setFocusLifecycle] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (focusLifecycle) lifecycleFocusRef.current?.focus();
  }, [focusLifecycle, query.data?.status]);

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
  const now = new Date();
  const applicationsClosed = isContributionRequestApplicationsClosed(
    request,
    now,
  );
  const statusMeta = getOwnerContributionRequestStatusMeta(request, now);

  async function update(payload: ContributionRequestDraftPayload) {
    setSaved(false);
    setUpdateError(null);
    const idempotencyKey = updateIdempotency.current.getFor({
      requestId,
      payload,
    });
    try {
      await updateMutation.mutateAsync({ payload, idempotencyKey });
      updateIdempotency.current.clear();
      setSaved(true);
    } catch (error) {
      setUpdateError(getContributionRequestErrorMessage(error));
    }
  }

  async function discard(reason: string) {
    setDiscardError(null);
    const payload = reason ? { reason } : {};
    const idempotencyKey = discardIdempotency.current.getFor({
      requestId,
      payload,
    });
    try {
      await discardMutation.mutateAsync({ payload, idempotencyKey });
      discardIdempotency.current.clear();
      setDiscardOpen(false);
      setFocusLifecycle(true);
    } catch (error) {
      setDiscardError(getContributionRequestErrorMessage(error));
    }
  }

  async function publish() {
    setPublishError(null);
    const idempotencyKey = publishIdempotency.current.getFor({
      requestId,
      action: "publish",
    });
    try {
      await publishMutation.mutateAsync({ idempotencyKey });
      publishIdempotency.current.clear();
      setPublishOpen(false);
      setFocusLifecycle(true);
    } catch (error) {
      setPublishError(getContributionRequestErrorMessage(error));
    }
  }

  async function cancel(reason: string) {
    setCancelError(null);
    const payload = reason ? { reason } : {};
    const idempotencyKey = cancelIdempotency.current.getFor({
      requestId,
      payload,
    });
    try {
      await cancelMutation.mutateAsync({ payload, idempotencyKey });
      cancelIdempotency.current.clear();
      setCancelOpen(false);
      setFocusLifecycle(true);
    } catch (error) {
      setCancelError(getContributionRequestErrorMessage(error));
    }
  }

  const descriptionByStatus: Record<typeof request.status, string> = {
    draft: "مسودة خاصة بصاحب المشروع. لا تظهر للمساهمين قبل النشر.",
    published: "منشور ومرئي للمساهمين حتى وقت إغلاق التقديم.",
    assigned: "أُسنِد هذا الطلب لمساهم. لم تعد إجراءات النشر أو الإلغاء متاحة.",
    in_progress: "قيد التنفيذ حاليًا.",
    awaiting_delivery: "بانتظار تسليم العمل.",
    delivery_submitted: "تم تقديم التسليم للمراجعة.",
    completed: "أُنجز هذا الطلب.",
    cancelled: "أُلغي هذا الطلب المنشور. يبقى سجل الطلبات والقرارات محفوظًا.",
    expired: "انتهت صلاحية هذا الطلب.",
    discarded: "تم تجاهل هذه المسودة قبل نشرها. يبقى سجلها محفوظًا للعرض فقط.",
  };

  return (
    <PageContainer className="max-w-4xl">
      <div
        id="contribution-request-lifecycle-focus"
        ref={lifecycleFocusRef}
        tabIndex={-1}
        className="outline-none"
      >
        <PageHeader
          title={request.title}
          description={
            applicationsClosed
              ? `منشور، لكن التقديم مغلق منذ ${formatContributionDateTime(request.applicationsCloseTime)}.`
              : descriptionByStatus[request.status]
          }
          actions={
            <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
              {statusMeta.label}
            </StatusChip>
          }
        />
      </div>

      {request.status === "discarded" ? (
        <Card className="mt-6 border-destructive/25 bg-destructive/5">
          <h2 className="text-lg font-bold text-foreground">
            مسودة متجاهلة — للعرض فقط
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            تم إنهاء هذه المسودة دون حذف سجلها. لا يمكن تعديلها أو إعادتها من
            هذه الواجهة.
          </p>
          <ReadOnlyRequest request={request} />
          <Button asChild variant="outline" className="mt-5">
            <a href={projectHref(request.projectId)}>العودة إلى المشروع</a>
          </Button>
        </Card>
      ) : request.status === "cancelled" ? (
        <Card className="mt-6 border-destructive/25 bg-destructive/5">
          <h2 className="text-lg font-bold text-foreground">
            طلب ملغى — للعرض فقط
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            تم إلغاء هذا الطلب المنشور. طلبات التقديم والتقييمات والقرارات
            السابقة محفوظة ولم تُحذف.
          </p>
          <ReadOnlyRequest request={request} />
          <Button asChild variant="outline" className="mt-5">
            <a href={projectHref(request.projectId)}>العودة إلى المشروع</a>
          </Button>
        </Card>
      ) : editable ? (
        <Card className="mt-6">
          {saved && (
            <p
              role="status"
              aria-live="polite"
              className="mb-4 text-sm text-evidence-teal"
            >
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
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="font-bold text-foreground">نشر الطلب</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              يصبح الطلب مرئيًا للمساهمين فورًا ويخضع لحد النشر الشهري المرتبط
              بباقتك.
            </p>
            <Button
              id="publish-request-trigger"
              type="button"
              size="sm"
              className="mt-3"
              onClick={() => {
                setFocusLifecycle(false);
                setPublishError(null);
                setPublishOpen(true);
              }}
            >
              نشر الطلب
            </Button>
          </div>
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
                setFocusLifecycle(false);
                setDiscardError(null);
                setDiscardOpen(true);
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              تجاهل المسودة
            </Button>
          </div>
        </Card>
      ) : request.status === "published" ? (
        <Card className="mt-6">
          <ReadOnlyRequest request={request} />
          {applicationsClosed && (
            <div
              role="status"
              className="mt-6 rounded-input border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <h2 className="font-bold text-foreground">التقديم مغلق</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                لا يستقبل طلبات تقديم جديدة بعد انتهاء مهلة التقديم. تظل
                الطلبات السابقة محفوظة ويمكنك مراجعتها واتخاذ القرار بشأنها.
              </p>
            </div>
          )}
          <div className="mt-6 border-t border-destructive/25 pt-5">
            <h2 className="font-bold text-foreground">إلغاء الطلب</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              الإلغاء نهائي، يوقف استقبال طلبات تقديم جديدة، ويحافظ على سجل
              الطلبات والقرارات السابقة.
            </p>
            <Button
              id="cancel-request-trigger"
              type="button"
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={() => {
                setFocusLifecycle(false);
                setCancelError(null);
                setCancelOpen(true);
              }}
            >
              إلغاء الطلب
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-6">
          <h2 className="text-lg font-bold text-foreground">
            طلب غير قابل للتعديل
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            حالة هذا السجل ({statusMeta.label}) لا تتيح إجراءات نشر أو إلغاء أو
            تعديل من هذه الواجهة.
          </p>
          <ReadOnlyRequest request={request} />
          <Button asChild variant="outline" className="mt-5">
            <a href={projectHref(request.projectId)}>العودة إلى المشروع</a>
          </Button>
        </Card>
      )}

      {request.status !== "draft" && request.status !== "discarded" && (
        <OwnerApplicationReview contributionRequestId={request.id} />
      )}

      {materialsSlot && (
        <div className="mt-5 rounded-card border border-border bg-card p-5">
          {materialsSlot}
        </div>
      )}

      {discardOpen && (
        <DiscardContributionRequestDialog
          isOpen
          isDiscarding={discardMutation.isPending}
          error={discardError}
          onCancel={() => {
            setDiscardOpen(false);
            document.getElementById("discard-request-trigger")?.focus();
          }}
          onConfirm={discard}
        />
      )}

      {publishOpen && (
        <PublishContributionRequestDialog
          isOpen
          isPublishing={publishMutation.isPending}
          error={publishError}
          onCancel={() => {
            setPublishOpen(false);
            document.getElementById("publish-request-trigger")?.focus();
          }}
          onConfirm={publish}
        />
      )}

      {cancelOpen && (
        <CancelContributionRequestDialog
          isOpen
          isCancelling={cancelMutation.isPending}
          error={cancelError}
          onCancel={() => {
            setCancelOpen(false);
            document.getElementById("cancel-request-trigger")?.focus();
          }}
          onConfirm={cancel}
        />
      )}
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
      {/*
        A draft generated from an accepted Proposal is what the owner edits and
        publishes. Without this the credit lived only on the proposal and
        vanished at the moment the work became public.
      */}
      {request.attribution && (
        <div className="sm:col-span-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <dt className="text-xs text-muted-foreground">
            مقترح مقبول من مساهم
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm font-semibold text-foreground">
            <span>{request.attribution.contributorName}</span>
            {request.attribution.contributorUsername !== null && (
              <span dir="ltr" className="text-xs font-normal text-muted-foreground">
                @{request.attribution.contributorUsername}
              </span>
            )}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            الإسناد اعتراف بالفكرة، ولا يمنح إسناد عمل ولا أولوية اختيار.
          </p>
        </div>
      )}
      <ReadOnlyField
        label="الوصف"
        value={request.description}
        className="sm:col-span-2"
      />
      <ReadOnlyField
        label="المتطلبات المطلوبة"
        value={request.requiredRequirements.map((item) => item.text).join("، ")}
      />
      <ReadOnlyField
        label="المتطلبات المفضلة"
        value={
          request.preferredRequirements.map((item) => item.text).join("، ") ||
          "—"
        }
      />
      {/*
        Owner pages were printing the raw ISO string, so an owner who entered
        12:00 read back 2030-06-15T09:00:00.000Z -- the right instant, but it
        looks like the deadline moved. The contributor pages already used these
        formatters, which render in the reader's own timezone.
      */}
      <ReadOnlyField
        label="وقت إغلاق التقديم"
        value={formatContributionDateTime(request.applicationsCloseTime)}
      />
      <ReadOnlyField
        label="تاريخ الإنجاز المستهدف"
        value={formatContributionDate(request.targetCompletionDate)}
      />
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
