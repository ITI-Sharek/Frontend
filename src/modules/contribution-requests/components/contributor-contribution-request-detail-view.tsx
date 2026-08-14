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
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

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
import { getApplicationSubmissionSchema } from "../schemas/application-submission.schema";
import type {
  ApplicationSubmissionInput,
  ApplicationSubmissionValues,
} from "../schemas/application-submission.schema";
import {
  getApplicationDailyLimitResetCopy,
  getApplicationSubmissionErrorMessage,
  getApplicationStatusCopy,
  getApplicationSubmissionErrorMeta,
  isApplicationApiErrorCode,
} from "../constants/application-copy";
import {
  getContributionRequestDifficultyLabel,
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
  materialsSlot,
  guidanceSlot,
  submissionBlockSlot,
  isSubmissionBlocked,
  blockedSubmitAction,
  onBlockedBySkillGap,
  applicationQuotaSlot,
  onApplicationQuotaChanged,
}: {
  requestId: string;
  requestsHref: string;
  dashboardHref: string;
  applicationHref: (applicationId: string) => string;
  projectHref: (projectSlug: string) => string;
  onApplicationSubmitted: (application: ApplicationDto) => void;
  materialsSlot?: ReactNode;
  guidanceSlot?: ReactNode;
  /**
   * The eligibility gate (DEC-078), composed by the route because it belongs to
   * the eligibility module and modules never import each other.
   *
   * This view is handed a node and a boolean, never eligibility data. A view
   * that could read the verdict would eventually start deciding with it, and
   * that decision is the backend's.
   */
  submissionBlockSlot?: ReactNode;
  isSubmissionBlocked?: boolean;
  /**
   * The blocked submit control. Built by the route so the accessible name that
   * explains *why* it is disabled lives next to the panel that explains it,
   * rather than being reassembled here from a count.
   */
  blockedSubmitAction?: ReactNode;
  /**
   * TOCTOU: the server refused at submit because eligibility changed after this
   * page rendered. The route lifts the named skills into the same explanation
   * rather than letting a generic toast swallow them.
   */
  onBlockedBySkillGap?: (error: unknown) => void;
  /**
   * The contributor's remaining daily Applications. Composed by the route
   * rather than imported here: the count belongs to the subscriptions module,
   * and modules never import each other.
   */
  applicationQuotaSlot?: ReactNode;
  /**
   * Called whenever a submission consumed or was refused by the allowance, so
   * the route can refresh whatever renders `applicationQuotaSlot`.
   */
  onApplicationQuotaChanged?: () => void;
}) {
  const { t } = useTranslation();
  const query = useContributionRequestDetailsQuery(requestId);

  if (query.isPending) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={Loader2}
          title={t("contributionRequests.contributorDetail.loadingTitle")}
          description={t("contributionRequests.contributorDetail.loadingDescription")}
        />
      </PageContainer>
    );
  }
  if (query.isError) {
    return (
      <PageContainer className="max-w-4xl">
        <PageFeedback
          icon={CircleAlert}
          title={t("contributionRequests.contributorDetail.unavailableTitle")}
          description={t("contributionRequests.contributorDetail.unavailableDescription")}
          action={
            <Button asChild size="sm">
              <a href={requestsHref}>{t("contributionRequests.contributorDetail.availableRequests")}</a>
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
        {t("contributionRequests.contributorDetail.backToRequests")}
      </a>
      <RequestOverview request={request} projectHref={projectHref} />
      <RequirementSections requirements={request.requirements} />
      {guidanceSlot}
      <RequestMetadata request={request} />
      {materialsSlot && (
        <div className="mt-5 rounded-card border border-border bg-card p-5">
          {materialsSlot}
        </div>
      )}
      <ApplicationSubmissionGate
        requestId={request.id}
        requestsHref={requestsHref}
        dashboardHref={dashboardHref}
        applicationHref={applicationHref}
        onSubmitted={onApplicationSubmitted}
        submissionBlockSlot={submissionBlockSlot}
        isSubmissionBlocked={isSubmissionBlocked}
        blockedSubmitAction={blockedSubmitAction}
        onBlockedBySkillGap={onBlockedBySkillGap}
        applicationQuotaSlot={applicationQuotaSlot}
        onApplicationQuotaChanged={onApplicationQuotaChanged}
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
  submissionBlockSlot,
  isSubmissionBlocked,
  blockedSubmitAction,
  onBlockedBySkillGap,
  applicationQuotaSlot,
  onApplicationQuotaChanged,
}: {
  requestId: string;
  requestsHref: string;
  dashboardHref: string;
  applicationHref: (applicationId: string) => string;
  onSubmitted: (application: ApplicationDto) => void;
  submissionBlockSlot?: ReactNode;
  isSubmissionBlocked?: boolean;
  blockedSubmitAction?: ReactNode;
  onBlockedBySkillGap?: (error: unknown) => void;
  applicationQuotaSlot?: ReactNode;
  onApplicationQuotaChanged?: () => void;
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
      submissionBlockSlot={submissionBlockSlot}
      isSubmissionBlocked={isSubmissionBlocked}
      blockedSubmitAction={blockedSubmitAction}
      onBlockedBySkillGap={onBlockedBySkillGap}
      applicationQuotaSlot={applicationQuotaSlot}
      onApplicationQuotaChanged={onApplicationQuotaChanged}
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
  const { t } = useTranslation();
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
        {t("contributionRequests.contributorDetail.checkingApplication")}
      </Card>
    );
  }

  if (isInvalidApplication) return null;

  const application = applicationQuery.data;
  const statusCopy = getApplicationStatusCopy()[application.status];

  return (
    <Card className="mt-5 p-5 shadow-none">
      <p className="text-xs font-semibold text-muted-foreground">
        {t("contributionRequests.contributorDetail.applicationStatus")}
      </p>
      <h2 className="mt-1 text-lg font-bold text-foreground">
        {statusCopy.label}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {statusCopy.description}
      </p>
      {application.status === "WITHDRAWN" ? (
        <p className="mt-4 rounded-input border border-border bg-border/20 p-3 text-sm font-medium text-foreground">
          {t("contributionRequests.contributorDetail.withdrawnNotice")}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("contributionRequests.contributorDetail.oneApplicationNotice")}
        </p>
      )}
      <Button asChild className="mt-4">
        <a href={applicationHref(application.id)}>{t("contributionRequests.contributorDetail.openApplication")}</a>
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
  const { t } = useTranslation();
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
            {getContributionRequestDifficultyLabel(request.difficulty)}
          </span>
        )}
      </div>
      <p className="mt-5 whitespace-pre-wrap leading-8 text-muted-foreground">
        {request.description}
      </p>
      {request.attribution && (
        <div className="mt-4 rounded-input border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-semibold text-foreground">
            {t("contributionRequests.contributorDetail.proposedBy")} {" "}
            <span dir="ltr">
              {request.attribution.contributorUsername
                ? `@${request.attribution.contributorUsername}`
                : request.attribution.contributorName}
            </span>
          </p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {t("contributionRequests.contributorDetail.attributionHelp")}
          </p>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          {t("tasks.technologies")}:
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
  const { t } = useTranslation();
  const required = requirements.filter(
    (requirement) => requirement.classification === "required",
  );
  const preferred = requirements.filter(
    (requirement) => requirement.classification === "preferred",
  );
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2">
      <Requirements
        title={t("contributionRequests.form.requiredRequirements")}
        description={t("contributionRequests.contributorDetail.requiredHelp")}
        requirements={required.map((requirement) => requirement.text)}
      />
      <Requirements
        title={t("contributionRequests.form.preferredRequirements")}
        description={t("contributionRequests.contributorDetail.preferredHelp")}
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
  const { t } = useTranslation();
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
        <p className="mt-4 text-sm text-muted-foreground">{t("contributionRequests.contributorDetail.noItems")}</p>
      )}
    </Card>
  );
}

function RequestMetadata({ request }: { request: ContributionRequestDetailDto }) {
  const { t } = useTranslation();
  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="font-bold text-foreground">{t("contributionRequests.contributorDetail.metadata")}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <Detail
          label={t("contributionRequests.form.closeTime")}
          value={formatContributionDateTime(request.applicationsCloseAt)}
        />
        <Detail
          label={t("contributionRequests.form.targetDate")}
          value={formatContributionDate(request.targetCompletionDate)}
        />
        <Detail
          label={t("tasks.reward")}
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
  submissionBlockSlot,
  isSubmissionBlocked,
  blockedSubmitAction,
  onBlockedBySkillGap,
  applicationQuotaSlot,
  onApplicationQuotaChanged,
}: {
  requestId: string;
  requestsHref: string;
  dashboardHref: string;
  onSubmitted: (application: ApplicationDto) => void;
  onApplicationRemembered: (applicationId: string) => void;
  submissionBlockSlot?: ReactNode;
  isSubmissionBlocked?: boolean;
  blockedSubmitAction?: ReactNode;
  onBlockedBySkillGap?: (error: unknown) => void;
  applicationQuotaSlot?: ReactNode;
  onApplicationQuotaChanged?: () => void;
}) {
  const { t, i18n } = useTranslation();
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
      resolver: zodResolver(getApplicationSubmissionSchema(t)),
      defaultValues: {
        contributionApproach: "",
        proposedDeliveryDurationDays: "7",
      },
      shouldFocusError: true,
    },
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorCode, setSubmitErrorCode] = useState<string | null>(null);
  const [submitErrorDetail, setSubmitErrorDetail] = useState<string | null>(
    null,
  );

  async function submit({
    contributionApproach: normalizedApproach,
    proposedDeliveryDurationDays: durationDays,
  }: ApplicationSubmissionValues) {
    setSubmitError(null);
    setSubmitErrorCode(null);
    setSubmitErrorDetail(null);
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
      // A created Application spends one of today's allowance, so whatever
      // renders the remaining count is now stale.
      onApplicationQuotaChanged?.();
      onApplicationRemembered(application.id);
      onSubmitted(application);
    } catch (error) {
      const code = getApiErrorCode(error);
      if (code === "APPLICATION_BLOCKED_SKILL_GAP") {
        // Eligibility changed after this page rendered. The refusal already
        // names every blocking skill, so it becomes the same explanation the
        // page would have shown up front — not a generic error toast, which
        // would leave the contributor with nothing to act on.
        onBlockedBySkillGap?.(error);
        return;
      }
      setSubmitErrorCode(code);
      setSubmitError(getApplicationSubmissionErrorMessage(error));
      if (code === "APPLICATION_DAILY_LIMIT_REACHED") {
        // The server's own reset instant, formatted but never recomputed.
        setSubmitErrorDetail(
          getApplicationDailyLimitResetCopy(error, i18n.language),
        );
        // The refusal proves the count the form was showing is out of date.
        onApplicationQuotaChanged?.();
      }
    }
  }

  if (isSubmissionBlocked) {
    // The form is not rendered at all, rather than rendered and disabled.
    // Leaving the fields reachable would invite someone to write a whole
    // application they cannot send — and the block is a "not yet", so the
    // honest thing is to show the path instead of a dead form.
    return (
      <div id="eligibility-block-panel">
        {submissionBlockSlot}
        <div className="mt-4">
          {blockedSubmitAction ?? (
            <Button type="button" disabled aria-disabled="true">
              {t("contributionRequests.contributorDetail.submit")}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-5 p-5 shadow-none">
      <h2 className="text-lg font-bold text-foreground">{t("contributionRequests.contributorDetail.submitTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("contributionRequests.contributorDetail.submitDescription")}
      </p>
      {/*
        Before the form, not only inside its error state: a contributor who
        learns their allowance from a rejected submit has already written the
        whole thing.
      */}
      {applicationQuotaSlot ? (
        <div className="mt-4">{applicationQuotaSlot}</div>
      ) : null}
      <form
        className="mt-5 grid gap-4"
        onSubmit={handleSubmit(submit)}
      >
        <div>
          <label
            htmlFor="contribution-approach"
            className="text-sm font-semibold text-foreground"
          >
            {t("contributionRequests.contributorDetail.approach")}
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
            placeholder={t("contributionRequests.contributorDetail.approachPlaceholder")}
            {...register("contributionApproach")}
          />
          <p
            id="contribution-approach-help"
            className="mt-1 text-xs text-muted-foreground"
          >
            {t("contributionRequests.contributorDetail.approachHelp")}
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
            {t("contributionRequests.contributorDetail.proposedDuration")}
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
            detail={submitErrorDetail}
            requestsHref={requestsHref}
            dashboardHref={dashboardHref}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending
              ? t("contributionRequests.contributorDetail.submitting")
              : t("contributionRequests.contributorDetail.submit")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t("contributionRequests.contributorDetail.submitHelp")}
          </p>
        </div>
      </form>
    </Card>
  );
}

function SubmissionError({
  code,
  message,
  detail,
  requestsHref,
  dashboardHref,
}: {
  code: string | null;
  message: string;
  /** Server-supplied supporting copy, such as when an allowance refills. */
  detail: string | null;
  requestsHref: string;
  dashboardHref: string;
}) {
  const { t } = useTranslation();
  const recovery = isApplicationApiErrorCode(code)
    ? getApplicationSubmissionErrorMeta()[code].recovery
    : null;
  return (
    <div
      id="application-submit-error"
      role="alert"
      className="rounded-input border border-destructive/25 bg-destructive/5 p-3"
    >
      <p className="text-sm text-destructive">{message}</p>
      {detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}
      {recovery === "daily_limit" && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("contributionRequests.contributorDetail.dailyLimitRecovery")}
        </p>
      )}
      {recovery === "existing_application" && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("contributionRequests.contributorDetail.existingApplicationRecovery")}
        </p>
      )}
      {recovery === "available_requests" && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={requestsHref}>{t("contributionRequests.contributorDetail.backToAvailable")}</a>
        </Button>
      )}
      {recovery === "account" && (
        <Button asChild variant="outline" size="sm" className="mt-3">
          <a href={dashboardHref}>{t("contributionRequests.contributorDetail.reviewAccount")}</a>
        </Button>
      )}
      {recovery === "edit" && (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("contributionRequests.contributorDetail.editRecovery")}
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
