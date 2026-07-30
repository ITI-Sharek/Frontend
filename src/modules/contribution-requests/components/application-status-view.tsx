import {
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  FileSearch,
  Flag,
  Loader2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import { ReportDecisionFeedbackDialog } from "./report-decision-feedback-dialog";
import { useReportDecisionFeedbackMutation } from "../api/mutations/use-report-decision-feedback-mutation";
import { useWithdrawApplicationMutation } from "../api/mutations/use-withdraw-application-mutation";
import { useApplicationQuery } from "../api/queries/use-application-query";
import {
  APPLICATION_STATUS_COPY,
  getApplicationErrorMessage,
} from "../constants/application-copy";
import {
  formatApplicationDate,
  getApplicationStatusMeta,
} from "../utils/application-presenter";
import type { DecisionFeedbackReportReason } from "../types/application.types";

export function ApplicationStatusView({
  applicationId,
  requestHref,
  requestsHref,
}: {
  applicationId: string;
  requestHref: (requestId: string) => string;
  requestsHref: string;
}) {
  const query = useApplicationQuery(applicationId);
  const reportMutation = useReportDecisionFeedbackMutation();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);

  if (query.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          icon={Loader2}
          title="جارٍ تحميل طلب التقديم"
          description="نسترجع الحالة الحالية والقرار المحفوظ."
        />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر فتح طلب التقديم"
          description={getApplicationErrorMessage(query.error)}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => void query.refetch()}>
                إعادة المحاولة
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={requestsHref}>العودة إلى طلبات المساهمة</a>
              </Button>
            </div>
          }
        />
      </PageContainer>
    );
  }

  const application = query.data;
  const status = getApplicationStatusMeta(application.status);
  const copy = APPLICATION_STATUS_COPY[application.status];
  const canReport =
    application.status === "DECLINED_BY_OWNER" &&
    application.ownerDecision?.decisionType === "DECLINED" &&
    Boolean(application.ownerDecision.feedback);

  async function submitReport(
    reason: DecisionFeedbackReportReason,
    description: string,
  ) {
    if (!application.ownerDecision) return;
    setReportError(null);
    try {
      await reportMutation.mutateAsync({
        ownerDecisionId: application.ownerDecision.id,
        reason,
        description,
      });
      setReportOpen(false);
      setReportSent(true);
      document.getElementById("decision-feedback-report-trigger")?.focus();
    } catch (error) {
      setReportError(getApplicationErrorMessage(error));
    }
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={status.title}
        description={copy.description}
        actions={
          <StatusChip tone={status.tone} icon={status.icon}>
            {copy.label}
          </StatusChip>
        }
      />

      <p role="status" aria-live="polite" className="sr-only">
        {copy.label}: {copy.description}
      </p>

      {status.neutralEffect && (
        <div className="mt-6 flex items-start gap-3 rounded-input border border-border bg-border/20 p-4">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-evidence-teal"
            aria-hidden="true"
          />
          <p className="text-sm leading-6 text-foreground">
            {status.neutralEffect}
          </p>
        </div>
      )}

      {reportSent && (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 rounded-input bg-evidence-teal/10 px-4 py-3 text-sm leading-6 text-foreground"
        >
          أُرسل البلاغ للمراجعة الإشرافية. لم تتغير حالة طلب التقديم أو تُفتح
          من جديد.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)]">
        <Card className="p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <BriefcaseBusiness className="size-5" aria-hidden="true" />
            نهج المساهمة
          </h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
            {application.contributionApproach ||
              "لا يوجد نهج محفوظ في هذا السجل."}
          </p>

          <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <StatusField
              icon={CalendarClock}
              label="مدة التسليم المقترحة"
              value={
                application.proposedDeliveryDurationDays === null
                  ? "غير محددة"
                  : `${application.proposedDeliveryDurationDays} يوم`
              }
            />
            <StatusField
              icon={CalendarClock}
              label="تاريخ التقديم"
              value={formatApplicationDate(application.submittedAt)}
            />
            {application.expiresAt && (
              <StatusField
                icon={CalendarClock}
                label="نهاية نافذة المراجعة"
                value={formatApplicationDate(application.expiresAt)}
              />
            )}
            {application.ownerDecision && (
              <StatusField
                icon={UserRound}
                label="وقت قرار المالك"
                value={formatApplicationDate(
                  application.ownerDecision.decidedAt,
                )}
              />
            )}
          </dl>
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="text-base font-bold text-foreground">
            أساس المراجعة المثبت
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <SnapshotCount
              label="المتطلبات المطلوبة"
              count={application.requirementSnapshot.required.length}
            />
            <SnapshotCount
              label="المتطلبات المفضلة"
              count={application.requirementSnapshot.preferred.length}
            />
            <SnapshotCount
              label="ملخصات الأدلة"
              count={application.evidenceSummary.length}
            />
          </dl>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            هذه لقطة محفوظة وقت التقديم. لا تعني ترتيبًا أو درجة أهلية أو قرارًا
            آليًا.
          </p>
        </Card>
      </div>

      {application.status === "PENDING_OWNER_REVIEW" && (
        <WithdrawalControls applicationId={application.id} />
      )}

      {application.status === "ACCEPTED" && application.assignment && (
        <section
          aria-labelledby="assignment-heading"
          className="mt-6 rounded-card border border-evidence-teal/30 bg-evidence-teal/10 p-5 md:p-6"
        >
          <h2
            id="assignment-heading"
            className="text-lg font-bold text-foreground"
          >
            إسناد العمل
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <StatusText
              label="مدة التسليم المتفق عليها"
              value={`${application.assignment.agreedDeliveryDurationDays} يوم`}
            />
            <StatusText
              label="موعد التسليم المتفق عليه"
              value={formatApplicationDate(
                application.assignment.agreedDeliveryDueDate,
              )}
            />
          </dl>
        </section>
      )}

      {application.status === "DECLINED_BY_OWNER" &&
        application.ownerDecision?.feedback && (
          <section
            aria-labelledby="owner-feedback-heading"
            className="mt-6 rounded-card border border-border bg-card p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="owner-feedback-heading"
                  className="text-lg font-bold text-foreground"
                >
                  ملاحظات صاحب المشروع
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  ملاحظات بشرية مرتبطة بقرار المالك، وليست نتيجة تقييم استشاري.
                </p>
              </div>
              <UserRound
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <blockquote className="mt-4 whitespace-pre-wrap break-words rounded-input bg-border/20 p-4 text-sm leading-7 text-foreground">
              {application.ownerDecision.feedback}
            </blockquote>
            {canReport && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
                  يمكنك الإبلاغ عن الإساءة أو المحتوى غير المناسب للمراجعة
                  الإشرافية. البلاغ ليس استئنافًا ولا يعيد فتح القرار.
                </p>
                <Button
                  id="decision-feedback-report-trigger"
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  disabled={reportSent}
                  onClick={() => {
                    setReportError(null);
                    setReportOpen(true);
                  }}
                >
                  <Flag className="size-4" aria-hidden="true" />
                  {reportSent ? "تم إرسال البلاغ" : "الإبلاغ عن الملاحظات"}
                </Button>
              </div>
            )}
          </section>
        )}

      <div className="mt-6">
        <Button asChild variant="outline">
          <a href={requestHref(application.contributionRequestId)}>
            العودة إلى طلب المساهمة
          </a>
        </Button>
      </div>

      {reportOpen && application.ownerDecision && (
        <ReportDecisionFeedbackDialog
          decision={application.ownerDecision}
          isOpen
          isSubmitting={reportMutation.isPending}
          error={reportError}
          onCancel={() => {
            setReportOpen(false);
            document.getElementById("decision-feedback-report-trigger")?.focus();
          }}
          onConfirm={submitReport}
        />
      )}
    </PageContainer>
  );
}

function WithdrawalControls({ applicationId }: { applicationId: string }) {
  const withdrawMutation = useWithdrawApplicationMutation();
  const withdrawalKey = useRef<string | null>(null);
  const [confirmWithdrawal, setConfirmWithdrawal] = useState(false);
  const [restoreFocus, setRestoreFocus] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    if (confirmWithdrawal) {
      document.getElementById("withdrawal-confirm")?.focus();
    } else if (restoreFocus) {
      document.getElementById("withdrawal-trigger")?.focus();
      setRestoreFocus(false);
    }
  }, [confirmWithdrawal, restoreFocus]);

  async function withdraw() {
    setWithdrawError(null);
    withdrawalKey.current ??= crypto.randomUUID();
    try {
      await withdrawMutation.mutateAsync({
        applicationId,
        idempotencyKey: withdrawalKey.current,
      });
      withdrawalKey.current = null;
      setConfirmWithdrawal(false);
    } catch (error) {
      const code = getApiErrorCode(error);
      setWithdrawError(
        code === "APPLICATION_TERMINAL"
          ? "لم يعد طلب التقديم بانتظار المراجعة، لذلك لا يمكن سحبه."
          : "تعذر سحب طلب التقديم الآن. حاول مرة أخرى.",
      );
    }
  }

  return (
    <Card className="mt-6 border-destructive/25 p-5 shadow-none">
      <h2 className="font-bold text-foreground">التحكم في الطلب</h2>
      {!confirmWithdrawal ? (
        <>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            يمكنك سحب طلب التقديم قبل صدور قرار صاحب المشروع. السحب نهائي،
            ولن تتمكن من التقديم على طلب المساهمة نفسه مرة أخرى.
          </p>
          <Button
            id="withdrawal-trigger"
            type="button"
            variant="destructive"
            size="sm"
            className="mt-4"
            onClick={() => setConfirmWithdrawal(true)}
          >
            سحب طلب التقديم
          </Button>
        </>
      ) : (
        <div
          role="group"
          aria-labelledby="withdrawal-confirmation-title"
          aria-describedby="withdrawal-confirmation-description"
        >
          <h3
            id="withdrawal-confirmation-title"
            className="mt-2 font-semibold text-foreground"
          >
            تأكيد سحب طلب التقديم
          </h3>
          <p
            id="withdrawal-confirmation-description"
            className="mt-1 text-sm text-muted-foreground"
          >
            هل تريد سحب طلب التقديم نهائيًا؟ لن تتمكن من إرسال طلب تقديم جديد
            لهذا الطلب.
          </p>
          {withdrawError && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {withdrawError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              id="withdrawal-confirm"
              type="button"
              variant="destructive"
              size="sm"
              disabled={withdrawMutation.isPending}
              onClick={() => void withdraw()}
            >
              {withdrawMutation.isPending ? "جارٍ السحب..." : "تأكيد السحب"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={withdrawMutation.isPending}
              onClick={() => {
                withdrawalKey.current = null;
                setWithdrawError(null);
                setRestoreFocus(true);
                setConfirmWithdrawal(false);
              }}
            >
              تراجع
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function StatusField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SnapshotCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <FileSearch className="size-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-semibold text-foreground">{count}</dd>
    </div>
  );
}

function StatusText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
