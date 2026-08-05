import {
  ArrowRight,
  CalendarClock,
  CircleAlert,
  FolderGit2,
  Loader2,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

import { getApiErrorCode } from "@/shared/utils/get-api-error-code";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  PageContainer,
  PageFeedback,
} from "@/shared/components/layout/page-layout";

import { useSubmitApplicationMutation } from "../api/mutations/use-submit-application-mutation";
import { useApplicationQuery } from "../api/queries/use-application-query";
import { useContributionRequestDetailsQuery } from "../api/queries/use-contribution-request-details-query";
import { useRememberedApplicationId } from "../hooks/use-remembered-application-id";
import { applicationSubmissionSchema } from "../schemas/application-submission.schema";
import type {
  ApplicationSubmissionInput,
  ApplicationSubmissionValues,
} from "../schemas/application-submission.schema";
import {
  APPLICATION_STATUS_COPY,
  APPLICATION_SUBMISSION_ERROR_META,
  getApplicationSubmissionErrorMessage,
  isApplicationApiErrorCode,
} from "../constants/application-copy";
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
  requestsHref,
  dashboardHref,
  applicationHref,
  projectHref,
  onApplicationSubmitted,
}: {
  requestId: string;
  requestsHref: string;
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
              <a href={requestsHref}>عرض الطلبات المتاحة</a>
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
        href={requestsHref}
        className="inline-flex min-h-8 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        العودة إلى طلبات المساهمة
      </a>
      <RequestOverview request={request} projectHref={projectHref} />
      <RequirementSections requirements={request.requirements} />
      <RequestMetadata request={request} />
      <ApplicationSubmissionGate
        requestId={request.id}
        requestsHref={requestsHref}
        dashboardHref={dashboardHref}
        applicationHref={applicationHref}
        onSubmitted={onApplicationSubmitted}
      />
    </PageContainer>
  );
}

function ApplicationSubmissionGate({
  requestId,
  requestsHref,
  dashboardHref,
  applicationHref,
  onSubmitted,
}: {
  requestId: string;
  requestsHref: string;
  dashboardHref: string;
  applicationHref: (applicationId: string) => string;
  onSubmitted: (application: ApplicationDto) => void;
}) {
  const {
    applicationId: existingApplicationId,
    rememberApplicationId,
    forgetApplicationId,
  } = useRememberedApplicationId(requestId);

  if (existingApplicationId) {
    return (
      <ExistingApplicationNotice
        applicationId={existingApplicationId}
        requestId={requestId}
        applicationHref={applicationHref}
        onInvalidApplication={forgetApplicationId}
      />
    );
  }

  return (
    <ApplicationSubmissionForm
      requestId={requestId}
      requestsHref={requestsHref}
      dashboardHref={dashboardHref}
      onSubmitted={onSubmitted}
      onApplicationRemembered={rememberApplicationId}
    />
  );
}

function ExistingApplicationNotice({
  applicationId,
  requestId,
  applicationHref,
  onInvalidApplication,
}: {
  applicationId: string;
  requestId: string;
  applicationHref: (applicationId: string) => string;
  onInvalidApplication: () => void;
}) {
  const applicationQuery = useApplicationQuery(applicationId);
  const rememberedApplicationRequestId =
    applicationQuery.data?.contributionRequestId;
  const isInvalidApplication =
    applicationQuery.isError ||
    (rememberedApplicationRequestId !== undefined &&
      rememberedApplicationRequestId !== requestId);

  useEffect(() => {
    if (isInvalidApplication) onInvalidApplication();
  }, [isInvalidApplication, onInvalidApplication]);

  if (applicationQuery.isPending) {
    return (
      <Card className="mt-5 flex items-center gap-3 p-5 text-sm text-muted-foreground shadow-none">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        جارٍ التحقق من حالة طلب التقديم السابق...
      </Card>
    );
  }

  if (isInvalidApplication) return null;

  const application = applicationQuery.data;
  const statusCopy = APPLICATION_STATUS_COPY[application.status];

  return (
    <Card className="mt-5 p-5 shadow-none">
      <p className="text-xs font-semibold text-muted-foreground">
        حالة طلب التقديم
      </p>
      <h2 className="mt-1 text-lg font-bold text-foreground">
        {statusCopy.label}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {statusCopy.description}
      </p>
      {application.status === "WITHDRAWN" ? (
        <p className="mt-4 rounded-input border border-border bg-border/20 p-3 text-sm font-medium text-foreground">
          لا يمكنك إرسال طلب تقديم جديد لهذا الطلب بعد السحب.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          يمكنك إرسال طلب تقديم واحد فقط لكل طلب مساهمة.
        </p>
      )}
      <Button asChild className="mt-4">
        <a href={applicationHref(application.id)}>فتح حالة طلب التقديم</a>
      </Button>
    </Card>
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
  requestsHref,
  dashboardHref,
  onSubmitted,
  onApplicationRemembered,
}: {
  requestId: string;
  requestsHref: string;
  dashboardHref: string;
  onSubmitted: (application: ApplicationDto) => void;
  onApplicationRemembered: (applicationId: string) => void;
}) {
  const submitMutation = useSubmitApplicationMutation();
  const submissionCommand = useRef<{
    fingerprint: string;
    idempotencyKey: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationSubmissionInput, unknown, ApplicationSubmissionValues>(
    {
      resolver: zodResolver(applicationSubmissionSchema),
      defaultValues: {
        contributionApproach: "",
        proposedDeliveryDurationDays: "7",
      },
      shouldFocusError: true,
    },
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorCode, setSubmitErrorCode] = useState<string | null>(null);

  async function submit({
    contributionApproach: normalizedApproach,
    proposedDeliveryDurationDays: durationDays,
  }: ApplicationSubmissionValues) {
    setSubmitError(null);
    setSubmitErrorCode(null);
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
      onApplicationRemembered(application.id);
      onSubmitted(application);
    } catch (error) {
      const code = getApiErrorCode(error);
      setSubmitErrorCode(code);
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
        onSubmit={handleSubmit(submit)}
      >
        <div>
          <label
            htmlFor="contribution-approach"
            className="text-sm font-semibold text-foreground"
          >
            نهج المساهمة
          </label>
          <textarea
            id="contribution-approach"
            rows={6}
            required
            minLength={10}
            maxLength={5000}
            aria-invalid={Boolean(errors.contributionApproach)}
            aria-describedby={`contribution-approach-help${errors.contributionApproach ? " contribution-approach-error" : ""}`}
            className="mt-2 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            placeholder="اشرح كيف ستنفذ العمل وما الذي ستسلّمه."
            {...register("contributionApproach")}
          />
          <p
            id="contribution-approach-help"
            className="mt-1 text-xs text-muted-foreground"
          >
            هذا سياق يكتبه المساهم لصاحب المشروع، وليس دليل مهارة موثقًا.
          </p>
          {errors.contributionApproach && (
            <p
              id="contribution-approach-error"
              className="mt-1 text-sm text-destructive"
            >
              {errors.contributionApproach.message}
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
            id="proposed-delivery-duration"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            required
            aria-invalid={Boolean(errors.proposedDeliveryDurationDays)}
            aria-describedby={
              errors.proposedDeliveryDurationDays
                ? "proposed-delivery-duration-error"
                : undefined
            }
            className="mt-2 min-h-11 w-full rounded-input border border-border bg-input-bg px-4 text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            {...register("proposedDeliveryDurationDays")}
          />
          {errors.proposedDeliveryDurationDays && (
            <p
              id="proposed-delivery-duration-error"
              className="mt-1 text-sm text-destructive"
            >
              {errors.proposedDeliveryDurationDays.message}
            </p>
          )}
        </div>
        {submitError && (
          <SubmissionError
            code={submitErrorCode}
            message={submitError}
            requestsHref={requestsHref}
            dashboardHref={dashboardHref}
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
  requestsHref,
  dashboardHref,
}: {
  code: string | null;
  message: string;
  requestsHref: string;
  dashboardHref: string;
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
      {recovery === "existing_application" && (
        <p className="mt-2 text-xs text-muted-foreground">
          افتح رابط الحالة من إشعار تأكيد الإرسال السابق.
        </p>
      )}
      {recovery === "available_requests" && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={requestsHref}>العودة إلى الطلبات المتاحة</a>
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
