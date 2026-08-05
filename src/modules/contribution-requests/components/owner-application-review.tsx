import {
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  FileSearch,
  Loader2,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

import { AcceptApplicationDialog } from "./accept-application-dialog";
import { AdvisoryFitAssessment } from "./advisory-fit-assessment";
import { DeclineApplicationDialog } from "./decline-application-dialog";
import { useAcceptApplicationMutation } from "../api/mutations/use-accept-application-mutation";
import { useDeclineApplicationMutation } from "../api/mutations/use-decline-application-mutation";
import { useOwnerApplicationsQuery } from "../api/queries/use-owner-applications-query";
import {
  getApplicationErrorMessage,
  shouldRefreshApplicationAfterError,
} from "../constants/application-copy";
import {
  formatApplicationDate,
  getApplicationReviewTiming,
} from "../utils/application-presenter";
import type { ApplicationDto } from "../types/application.types";

type DecisionDialog =
  | { action: "accept"; application: ApplicationDto }
  | { action: "decline"; application: ApplicationDto }
  | null;

export function OwnerApplicationReview({
  contributionRequestId,
}: {
  contributionRequestId: string;
}) {
  const query = useOwnerApplicationsQuery(contributionRequestId);
  const acceptMutation = useAcceptApplicationMutation();
  const declineMutation = useDeclineApplicationMutation();
  const [dialog, setDialog] = useState<DecisionDialog>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  function openDialog(action: "accept" | "decline", application: ApplicationDto) {
    setAnnouncement(null);
    setDecisionError(null);
    idempotencyKey.current = createIdempotencyKey();
    setDialog({ action, application });
  }

  function closeDialog() {
    const triggerId = dialog
      ? `${dialog.action}-application-trigger-${dialog.application.id}`
      : null;
    setDialog(null);
    setDecisionError(null);
    idempotencyKey.current = null;
    if (triggerId) requestAnimationFrame(() => document.getElementById(triggerId)?.focus());
  }

  async function recoverFromError(error: unknown) {
    const message = getApplicationErrorMessage(error);
    if (shouldRefreshApplicationAfterError(error)) {
      await query.refetch();
      setDialog(null);
      idempotencyKey.current = null;
      setAnnouncement(message);
      document.getElementById("owner-application-review-heading")?.focus();
      return;
    }
    setDecisionError(message);
  }

  async function accept() {
    if (!dialog || dialog.action !== "accept") return;
    try {
      await acceptMutation.mutateAsync({
        applicationId: dialog.application.id,
        idempotencyKey:
          idempotencyKey.current ?? (idempotencyKey.current = createIdempotencyKey()),
      });
      setAnnouncement(
        `تم اختيار ${dialog.application.contributor.displayName} وإنشاء إسناد العمل.`,
      );
      setDialog(null);
      idempotencyKey.current = null;
      document.getElementById("owner-application-review-heading")?.focus();
    } catch (error) {
      await recoverFromError(error);
    }
  }

  async function decline(feedback: string) {
    if (!dialog || dialog.action !== "decline") return;
    try {
      await declineMutation.mutateAsync({
        applicationId: dialog.application.id,
        feedback,
        idempotencyKey:
          idempotencyKey.current ?? (idempotencyKey.current = createIdempotencyKey()),
      });
      setAnnouncement(
        `سُجّل قرار عدم اختيار طلب ${dialog.application.contributor.displayName}.`,
      );
      setDialog(null);
      idempotencyKey.current = null;
      document.getElementById("owner-application-review-heading")?.focus();
    } catch (error) {
      await recoverFromError(error);
    }
  }

  return (
    <section
      aria-labelledby="owner-application-review-heading"
      className="mt-8 overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="flex flex-col gap-3 border-b border-border bg-border/15 px-5 py-5 sm:flex-row sm:items-start sm:justify-between md:px-6">
        <div>
          <h2
            id="owner-application-review-heading"
            tabIndex={-1}
            className="text-xl font-bold text-foreground outline-none"
          >
            طلبات التقديم التي تحتاج قرارك
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            تظهر كل الطلبات المعلقة فورًا. يمكنك اتخاذ قرارك دون تقييم استشاري
            أو أثناء انتظاره؛ القرار النهائي مسؤوليتك أنت.
          </p>
        </div>
        {!query.isPending && !query.isError && (
          <span className="shrink-0 text-sm font-semibold text-foreground">
            {query.data.length} قيد المراجعة
          </span>
        )}
      </div>

      {announcement && (
        <p
          role="status"
          aria-live="polite"
          className="border-b border-evidence-teal/25 bg-evidence-teal/10 px-5 py-3 text-sm text-foreground md:px-6"
        >
          {announcement}
        </p>
      )}

      {query.isPending ? (
        <div className="flex min-h-48 items-center justify-center gap-2 px-5 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          جارٍ تحميل طلبات التقديم…
        </div>
      ) : query.isError ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
          <CircleAlert className="size-6 text-destructive" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">
            تعذر تحميل طلبات التقديم
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApplicationErrorMessage(query.error)}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => void query.refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : query.data.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
          <FileSearch className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">
            لا توجد طلبات معلقة الآن
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            ستظهر هنا طلبات التقديم الجديدة مباشرة عند وصولها إلى صاحب المشروع.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {query.data.map((application) => (
            <ApplicationReviewRecord
              key={application.id}
              application={application}
              decisionsDisabled={
                acceptMutation.isPending || declineMutation.isPending
              }
              onAccept={() => openDialog("accept", application)}
              onDecline={() => openDialog("decline", application)}
            />
          ))}
        </div>
      )}

      {dialog?.action === "accept" && (
        <AcceptApplicationDialog
          application={dialog.application}
          isOpen
          isSubmitting={acceptMutation.isPending}
          error={decisionError}
          onCancel={closeDialog}
          onConfirm={accept}
        />
      )}
      {dialog?.action === "decline" && (
        <DeclineApplicationDialog
          application={dialog.application}
          isOpen
          isSubmitting={declineMutation.isPending}
          error={decisionError}
          onCancel={closeDialog}
          onConfirm={decline}
        />
      )}
    </section>
  );
}

function ApplicationReviewRecord({
  application,
  decisionsDisabled,
  onAccept,
  onDecline,
}: {
  application: ApplicationDto;
  decisionsDisabled: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const timing = getApplicationReviewTiming(application);
  const experience = application.profileContext.experienceLevel;

  return (
    <article className="px-5 py-6 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">
              {application.contributor.displayName}
            </h3>
            {application.contributor.username && (
              <bdi
                dir="ltr"
                className="font-mono text-xs tracking-[0.35px] text-muted-foreground"
              >
                @{application.contributor.username}
              </bdi>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            أُرسل في {formatApplicationDate(application.submittedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={timing.tone} icon={timing.icon}>
            {timing.label}
          </StatusChip>
          {timing.detail && (
            <span className="text-xs text-muted-foreground">{timing.detail}</span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="min-w-0">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <BriefcaseBusiness className="size-4" aria-hidden="true" />
            نهج المساهمة
          </h4>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
            {application.contributionApproach || "لم يُحفظ نهج مساهمة في هذا السجل."}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
            مدة التسليم المقترحة:{" "}
            <strong className="font-semibold text-foreground">
              {application.proposedDeliveryDurationDays === null
                ? "غير محددة"
                : `${application.proposedDeliveryDurationDays} يوم`}
            </strong>
          </p>
        </div>

        <div className="min-w-0 rounded-input bg-border/20 p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <UserRound className="size-4" aria-hidden="true" />
            سياق الملف وقت التقديم
          </h4>
          <dl className="mt-3 space-y-2 text-sm">
            <ContextRow
              label="الخبرة"
              value={experience?.labelAr || experience?.labelEn || "غير محددة"}
            />
            <ContextRow
              label="التوفر"
              value={application.profileContext.availability || "غير محدد"}
            />
            <ContextRow
              label="المجالات"
              value={
                application.profileContext.fields
                  .map((field) => field.labelAr || field.labelEn)
                  .join("، ") || "غير محددة"
              }
            />
          </dl>
          {application.profileContext.bio && (
            <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
              {application.profileContext.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <h4 className="text-sm font-bold text-foreground">
          ملخص الأدلة المثبت وقت التقديم
        </h4>
        {application.evidenceSummary.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            لا يتضمن هذا السجل ملخص أدلة معتمدًا. غياب الدليل ليس حكمًا على
            القدرة ولا يمنعك من اتخاذ قرارك.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {application.evidenceSummary.map((evidence) => (
              <li
                key={evidence.skillProfileId}
                className="rounded-input border border-border p-4"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <strong className="text-sm text-foreground">
                    {evidence.name}
                  </strong>
                  <span className="font-mono text-xs text-muted-foreground">
                    {evidence.proficiencyLevel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {evidence.evidenceSummary || "لا يوجد ملخص نصي إضافي."}
                </p>
                {evidence.limitations.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-foreground">
                      حدود الدليل
                    </p>
                    <ul className="mt-1 list-disc space-y-1 ps-5 text-xs leading-5 text-muted-foreground">
                      {evidence.limitations.map((limitation) => (
                        <li key={limitation}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdvisoryFitAssessment application={application} />

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-5 text-muted-foreground">
          التقييم الاستشاري اختياري. لا يظهر هنا كشرط أو توصية أو ترتيب.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            id={`decline-application-trigger-${application.id}`}
            type="button"
            variant="outline"
            disabled={decisionsDisabled}
            onClick={onDecline}
          >
            عدم الاختيار مع ملاحظات
          </Button>
          <Button
            id={`accept-application-trigger-${application.id}`}
            type="button"
            disabled={decisionsDisabled}
            onClick={onAccept}
          >
            اختيار وإنشاء إسناد
          </Button>
        </div>
      </div>
    </article>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words text-end font-medium text-foreground">{value}</dd>
    </div>
  );
}
