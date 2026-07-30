import {
  Ban,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Loader2,
  Send,
  UserRoundX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import type { StatusChipTone } from "@/shared/components/data-display/status-chip";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import { useWithdrawApplicationMutation } from "../api/mutations/use-withdraw-application-mutation";
import { useApplicationQuery } from "../api/queries/use-application-query";
import { APPLICATION_STATUS_COPY } from "../constants/application-copy";
import { formatContributionDateTime } from "../utils/contributor-presentation";
import type {
  ApplicationDto,
  ApplicationStatus,
} from "../types/application.types";

const STATUS_PRESENTATION: Record<
  ApplicationStatus,
  { tone: StatusChipTone; icon: ComponentType<{ className?: string }> }
> = {
  PENDING_OWNER_REVIEW: { tone: "attention", icon: Clock3 },
  ACCEPTED: { tone: "positive", icon: CheckCircle2 },
  DECLINED_BY_OWNER: { tone: "neutral", icon: UserRoundX },
  NOT_SELECTED: { tone: "neutral", icon: UserRoundX },
  EXPIRED: { tone: "neutral", icon: Clock3 },
  WITHDRAWN: { tone: "neutral", icon: Ban },
  REQUEST_CANCELLED: { tone: "neutral", icon: Ban },
};

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

  if (query.isPending) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={Loader2}
          title="جارٍ تحميل حالة طلب التقديم"
          description="نسترجع آخر حالة سجّلها الخادم."
        />
      </PageContainer>
    );
  }
  if (query.isError) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={CircleAlert}
          title="تعذر فتح طلب التقديم"
          description="لم نعثر على الطلب، أو لا يملك هذا الحساب صلاحية عرضه."
          action={
            <Button asChild size="sm">
              <a href={requestsHref}>عرض طلبات المساهمة</a>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const application = query.data;
  const copy = APPLICATION_STATUS_COPY[application.status];
  const presentation = STATUS_PRESENTATION[application.status];
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="حالة طلب التقديم"
        actions={
          <StatusChip tone={presentation.tone} icon={presentation.icon}>
            {copy.label}
          </StatusChip>
        }
      />
      <StatusSummary
        label={copy.label}
        description={copy.description}
      />
      <ApplicationDetails application={application} />
      {application.ownerDecision?.feedback && (
        <OwnerFeedback feedback={application.ownerDecision.feedback} />
      )}
      {application.assignment && (
        <AssignmentDetails application={application} />
      )}
      {application.status === "PENDING_OWNER_REVIEW" && (
        <WithdrawalControls applicationId={applicationId} />
      )}
      <Button asChild variant="outline" className="mt-5">
        <a href={requestHref(application.contributionRequestId)}>
          العودة إلى طلب المساهمة
        </a>
      </Button>
    </PageContainer>
  );
}

function StatusSummary({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <Card role="status" aria-live="polite" className="mt-5 p-5 shadow-none">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-border/40 text-muted-foreground">
          <Send className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-bold text-foreground">{label}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

function ApplicationDetails({ application }: { application: ApplicationDto }) {
  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="font-bold text-foreground">تفاصيل طلبك</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Detail
          label="نهج المساهمة"
          value={application.contributionApproach ?? "لم يُضف نهج."}
          wide
        />
        <Detail
          label="مدة التسليم المقترحة"
          value={
            application.proposedDeliveryDurationDays
              ? `${application.proposedDeliveryDurationDays} أيام`
              : "غير محددة"
          }
          technical
        />
        <Detail
          label="وقت الإرسال"
          value={formatContributionDateTime(application.submittedAt)}
          technical
        />
        {application.reviewDueAt && (
          <Detail
            label="موعد المراجعة المتوقع"
            value={formatContributionDateTime(application.reviewDueAt)}
            technical
          />
        )}
      </dl>
    </Card>
  );
}

function OwnerFeedback({ feedback }: { feedback: string }) {
  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="font-bold text-foreground">ملاحظات صاحب المشروع</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
        {feedback}
      </p>
    </Card>
  );
}

function AssignmentDetails({ application }: { application: ApplicationDto }) {
  if (!application.assignment) return null;
  return (
    <Card className="mt-5 border-evidence-teal/25 p-5 shadow-none">
      <h2 className="font-bold text-foreground">تفاصيل الإسناد</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <Detail
          label="مدة التسليم المتفق عليها"
          value={`${application.assignment.agreedDeliveryDurationDays} أيام`}
          technical
        />
        <Detail
          label="موعد التسليم المتفق عليه"
          value={formatContributionDateTime(
            application.assignment.agreedDeliveryDueDate,
          )}
          technical
        />
      </dl>
    </Card>
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
    <Card className="mt-5 border-destructive/25 p-5 shadow-none">
      <h2 className="font-bold text-foreground">التحكم في الطلب</h2>
      {!confirmWithdrawal ? (
        <>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            يمكنك سحب طلب التقديم قبل صدور قرار صاحب المشروع. السحب نهائي.
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
            هل تريد سحب طلب التقديم نهائيًا؟
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

function Detail({
  label,
  value,
  wide = false,
  technical = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
  technical?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        dir={technical ? "ltr" : undefined}
        className={
          technical
            ? "mt-1 text-end font-mono text-sm leading-6 text-foreground"
            : "mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
