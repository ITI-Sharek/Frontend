import {
  ArrowRight,
  CalendarClock,
  CircleAlert,
  FolderGit2,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  getApiErrorCode,
  getApiErrorMetadataString,
} from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  PageContainer,
  PageFeedback,
} from "@/shared/components/layout/page-layout";

import { useSubmitApplicationMutation } from "../api/mutations/use-submit-application-mutation";
import { useContributionRequestDetailsQuery } from "../api/queries/use-contribution-request-details-query";
import {
  APPLICATION_SUBMISSION_ERROR_META,
  getApplicationSubmissionErrorMessage,
  isApplicationApiErrorCode,
} from "../constants/application-copy";
import {
  getRememberedApplicationId,
  rememberApplicationStatus,
} from "../utils/application-status-link";
import {
  CONTRIBUTION_REQUEST_DIFFICULTY_LABELS,
  formatContributionDate,
  formatContributionDateTime,
  formatContributionReward,
} from "../utils/contributor-presentation";
import type {
  ContributionRequestDetailDto,
  RequirementDto,
} from "../types/contribution-request.types";
import type { ApplicationDto } from "../types/application.types";

export function ContributorContributionRequestDetailView({
  requestId,
  tasksHref,
  dashboardHref,
  applicationHref,
  projectHref,
  onApplicationSubmitted,
}: {
  requestId: string;
  tasksHref: string;
  dashboardHref: string;
  applicationHref: (applicationId: string) => string;
  projectHref: (projectSlug: string) => string;
  onApplicationSubmitted: (application: ApplicationDto) => void;
}) {
  const query = useContributionRequestDetailsQuery(requestId);

  if (query.isPending) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={Loader2}
          title="جارٍ تحميل طلب المساهمة"
          description="نسترجع عقد العمل وحالة التقديم من الخادم."
        />
      </PageContainer>
    );
  }
  if (query.isError) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={CircleAlert}
          title="طلب المساهمة غير متاح"
          description="قد يكون التقديم أُغلق أو أُلغي، أو لم يعد المشروع منشورًا."
          action={
            <Button asChild size="sm">
              <a href={tasksHref}>عرض الطلبات المتاحة</a>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const request = query.data;
  return (
    <PageContainer className="max-w-5xl">
      <a
        href={tasksHref}
        className="inline-flex min-h-8 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        العودة إلى طلبات المساهمة
      </a>
      <RequestOverview request={request} projectHref={projectHref} />
      <RequirementSections requirements={request.requirements} />
      <RequestMetadata request={request} />
      <ApplicationSubmissionForm
        requestId={request.id}
        tasksHref={tasksHref}
        dashboardHref={dashboardHref}
        applicationHref={applicationHref}
        onSubmitted={onApplicationSubmitted}
      />
    </PageContainer>
  );
}

function RequestOverview({
  request,
  projectHref,
}: {
  request: ContributionRequestDetailDto;
  projectHref: (projectSlug: string) => string;
}) {
  return (
    <header className="mt-4 rounded-card border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {request.title}
          </h1>
          <a
            href={projectHref(request.projectSlug)}
            className="mt-2 inline-flex min-h-8 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <FolderGit2 className="size-4" aria-hidden="true" />
            {request.projectName}
          </a>
        </div>
        {request.difficulty && (
          <span className="rounded-full bg-border/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {CONTRIBUTION_REQUEST_DIFFICULTY_LABELS[request.difficulty]}
          </span>
        )}
      </div>
      <p className="mt-5 whitespace-pre-wrap leading-8 text-muted-foreground">
        {request.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          التقنيات:
        </span>
        {request.technologyTags.map((technology) => (
          <span
            key={technology}
            dir="ltr"
            className="rounded-full border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground"
          >
            {technology}
          </span>
        ))}
      </div>
    </header>
  );
}

function RequirementSections({
  requirements,
}: {
  requirements: RequirementDto[];
}) {
  const required = requirements.filter(
    (requirement) => requirement.classification === "required",
  );
  const preferred = requirements.filter(
    (requirement) => requirement.classification === "preferred",
  );
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2">
      <Requirements
        title="المتطلبات المطلوبة"
        description="عناصر أساسية لإتمام العمل."
        requirements={required.map((requirement) => requirement.text)}
      />
      <Requirements
        title="المتطلبات المفضلة"
        description="عناصر مفيدة لكنها ليست بديلًا عن المتطلبات المطلوبة."
        requirements={preferred.map((requirement) => requirement.text)}
      />
    </section>
  );
}

function Requirements({
  title,
  description,
  requirements,
}: {
  title: string;
  description: string;
  requirements: string[];
}) {
  return (
    <Card className="p-5 shadow-none">
      <h2 className="font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {requirements.length > 0 ? (
        <ul className="mt-4 grid gap-2">
          {requirements.map((requirement) => (
            <li
              key={requirement}
              className="rounded-input border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground"
            >
              {requirement}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد عناصر.</p>
      )}
    </Card>
  );
}

function RequestMetadata({ request }: { request: ContributionRequestDetailDto }) {
  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="font-bold text-foreground">تفاصيل الوقت والمكافأة</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <Detail
          label="وقت إغلاق التقديم"
          value={formatContributionDateTime(request.applicationsCloseAt)}
        />
        <Detail
          label="تاريخ الإنجاز المستهدف"
          value={formatContributionDate(request.targetCompletionDate)}
        />
        <Detail
          label="المكافأة"
          value={formatContributionReward(request.reward)}
        />
      </dl>
    </Card>
  );
}

function ApplicationSubmissionForm({
  requestId,
  tasksHref,
  dashboardHref,
  applicationHref,
  onSubmitted,
}: {
  requestId: string;
  tasksHref: string;
  dashboardHref: string;
  applicationHref: (applicationId: string) => string;
  onSubmitted: (application: ApplicationDto) => void;
}) {
  const submitMutation = useSubmitApplicationMutation();
  const approachRef = useRef<HTMLTextAreaElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const submissionCommand = useRef<{
    fingerprint: string;
    idempotencyKey: string;
  } | null>(null);
  const [approach, setApproach] = useState("");
  const [duration, setDuration] = useState("7");
  const [approachError, setApproachError] = useState<string | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorCode, setSubmitErrorCode] = useState<string | null>(null);
  const [existingApplicationId, setExistingApplicationId] = useState<
    string | null
  >(null);

  async function submit() {
    const normalizedApproach = approach.trim();
    const durationDays = Number(duration);
    const nextApproachError =
      normalizedApproach.length < 10 || normalizedApproach.length > 5000
        ? "اكتب نهج مساهمة من 10 إلى 5000 حرف."
        : null;
    const nextDurationError =
      !Number.isInteger(durationDays) ||
      durationDays < 1 ||
      durationDays > 365
        ? "حدد مدة تسليم كاملة بين يوم واحد و365 يومًا."
        : null;
    setApproachError(nextApproachError);
    setDurationError(nextDurationError);
    if (nextApproachError) {
      approachRef.current?.focus();
      return;
    }
    if (nextDurationError) {
      durationRef.current?.focus();
      return;
    }

    setSubmitError(null);
    setSubmitErrorCode(null);
    setExistingApplicationId(null);
    const fingerprint = JSON.stringify({
      requestId,
      contributionApproach: normalizedApproach,
      proposedDeliveryDurationDays: durationDays,
    });
    if (submissionCommand.current?.fingerprint !== fingerprint) {
      submissionCommand.current = {
        fingerprint,
        idempotencyKey: crypto.randomUUID(),
      };
    }
    try {
      const application = await submitMutation.mutateAsync({
        contributionRequestId: requestId,
        params: {
          contributionApproach: normalizedApproach,
          proposedDeliveryDurationDays: durationDays,
          idempotencyKey: submissionCommand.current.idempotencyKey,
        },
      });
      submissionCommand.current = null;
      rememberApplicationStatus(requestId, application.id);
      onSubmitted(application);
    } catch (error) {
      const code = getApiErrorCode(error);
      setSubmitErrorCode(code);
      if (code === "ALREADY_APPLIED") {
        setExistingApplicationId(
          getApiErrorMetadataString(error, "applicationId") ??
            getRememberedApplicationId(requestId),
        );
      }
      setSubmitError(getApplicationSubmissionErrorMessage(error));
    }
  }

  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="text-lg font-bold text-foreground">إرسال طلب تقديم</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        يُرسل طلب التقديم مباشرة إلى صاحب المشروع بحالة انتظار المراجعة. لا
        يبدأ أي تقييم تلقائي عند الإرسال.
      </p>
      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div>
          <label
            htmlFor="contribution-approach"
            className="text-sm font-semibold text-foreground"
          >
            نهج المساهمة
          </label>
          <textarea
            ref={approachRef}
            id="contribution-approach"
            rows={6}
            required
            minLength={10}
            maxLength={5000}
            value={approach}
            aria-invalid={Boolean(approachError)}
            aria-describedby={`contribution-approach-help${approachError ? " contribution-approach-error" : ""}`}
            className="mt-2 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            placeholder="اشرح كيف ستنفذ العمل وما الذي ستسلّمه."
            onChange={(event) => {
              setApproach(event.target.value);
              setApproachError(null);
            }}
          />
          <p
            id="contribution-approach-help"
            className="mt-1 text-xs text-muted-foreground"
          >
            هذا سياق يكتبه المساهم لصاحب المشروع، وليس دليل مهارة موثقًا.
          </p>
          {approachError && (
            <p
              id="contribution-approach-error"
              className="mt-1 text-sm text-destructive"
            >
              {approachError}
            </p>
          )}
        </div>
        <div className="max-w-xs">
          <label
            htmlFor="proposed-delivery-duration"
            className="text-sm font-semibold text-foreground"
          >
            مدة التسليم المقترحة (بالأيام)
          </label>
          <input
            ref={durationRef}
            id="proposed-delivery-duration"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            required
            value={duration}
            aria-invalid={Boolean(durationError)}
            aria-describedby={
              durationError ? "proposed-delivery-duration-error" : undefined
            }
            className="mt-2 min-h-11 w-full rounded-input border border-border bg-input-bg px-4 text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onChange={(event) => {
              setDuration(event.target.value);
              setDurationError(null);
            }}
          />
          {durationError && (
            <p
              id="proposed-delivery-duration-error"
              className="mt-1 text-sm text-destructive"
            >
              {durationError}
            </p>
          )}
        </div>
        {submitError && (
          <SubmissionError
            code={submitErrorCode}
            message={submitError}
            tasksHref={tasksHref}
            dashboardHref={dashboardHref}
            existingApplicationHref={
              existingApplicationId
                ? applicationHref(existingApplicationId)
                : null
            }
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending
              ? "جارٍ الإرسال..."
              : "إرسال إلى صاحب المشروع"}
          </Button>
          <p className="text-xs text-muted-foreground">
            ستنتقل بعد الإرسال إلى صفحة حالة طلبك.
          </p>
        </div>
      </form>
    </Card>
  );
}

function SubmissionError({
  code,
  message,
  tasksHref,
  dashboardHref,
  existingApplicationHref,
}: {
  code: string | null;
  message: string;
  tasksHref: string;
  dashboardHref: string;
  existingApplicationHref: string | null;
}) {
  const recovery = isApplicationApiErrorCode(code)
    ? APPLICATION_SUBMISSION_ERROR_META[code].recovery
    : null;
  return (
    <div
      id="application-submit-error"
      role="alert"
      className="rounded-input border border-destructive/25 bg-destructive/5 p-3"
    >
      <p className="text-sm text-destructive">{message}</p>
      {recovery === "existing_application" && existingApplicationHref && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={existingApplicationHref}>فتح حالة الطلب السابق</a>
        </Button>
      )}
      {recovery === "existing_application" && !existingApplicationHref && (
        <p className="mt-2 text-xs text-muted-foreground">
          افتح رابط الحالة من إشعار تأكيد الإرسال السابق.
        </p>
      )}
      {recovery === "available_requests" && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={tasksHref}>العودة إلى الطلبات المتاحة</a>
        </Button>
      )}
      {recovery === "account" && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={dashboardHref}>مراجعة حالة الحساب</a>
        </Button>
      )}
      {recovery === "edit" && (
        <p className="mt-2 text-xs text-muted-foreground">
          غيّر نهج المساهمة أو مدة التسليم قبل إعادة الإرسال.
        </p>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarClock className="size-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd
        dir="ltr"
        className="mt-1 text-end font-mono text-sm font-medium text-foreground"
      >
        {value}
      </dd>
    </div>
  );
}
