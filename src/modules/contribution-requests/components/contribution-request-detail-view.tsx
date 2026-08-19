import {
  CircleAlert,
  FileText,
  GitPullRequest,
  Loader2,
  Paperclip,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { cn } from "@/lib/utils";
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
import { getContributionRequestErrorMessage } from "../constants/contribution-request-copy";
import {
  useCancelContributionRequestMutation,
  useDiscardContributionRequestMutation,
  usePublishContributionRequestMutation,
  useUpdateContributionRequestMutation,
} from "../api/mutations/use-contribution-request-mutations";
import { useContributionRequestQuery } from "../api/queries/use-contribution-request-query";
import { replaceContributionRequestSkillRequirements } from "../services/contribution-requests.service";
import {
  resolveEffectiveSkillRequirements,
  toContributionRequestForm,
} from "../utils/contribution-request-form";
import { ContributionRequestIdempotencyKeyStore } from "../utils/idempotency-key";
import {
  getOwnerContributionRequestStatusMeta,
  isContributionRequestApplicationsClosed,
} from "../utils/contribution-request-status";
import {
  formatContributionDate,
  formatContributionDateTime,
} from "../utils/contributor-presentation";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestSkillRequirementInput,
} from "../types/contribution-request.types";

export type RequestWorkspaceTab =
  | "details"
  | "applications"
  | "matches"
  | "delivery"
  | "materials";

export function ContributionRequestDetailView({
  requestId,
  projectHref,
  materialsSlot,
  deliverySlot,
  matchingSlot,
  activeSection,
  onSectionChange,
}: {
  requestId: string;
  projectHref: (projectId: string) => string;
  materialsSlot?: ReactNode;
  deliverySlot?: ReactNode;
  matchingSlot?: ReactNode;
  activeSection?: RequestWorkspaceTab;
  onSectionChange?: (section: RequestWorkspaceTab) => void;
}) {
  const { t } = useTranslation();
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
  const dialogReturnFocusRef = useRef<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [focusLifecycle, setFocusLifecycle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [internalTab, setInternalTab] = useState<RequestWorkspaceTab>("details");
  const activeTab = activeSection ?? internalTab;

  function handleTabChange(tab: RequestWorkspaceTab) {
    if (onSectionChange) {
      onSectionChange(tab);
    } else {
      setInternalTab(tab);
    }
  }

  useEffect(() => {
    if (focusLifecycle) lifecycleFocusRef.current?.focus();
  }, [focusLifecycle, query.data?.status]);

  useEffect(() => {
    if (discardOpen || publishOpen || cancelOpen) return;
    const targetId = dialogReturnFocusRef.current;
    if (!targetId) return;
    dialogReturnFocusRef.current = null;
    document.getElementById(targetId)?.focus();
  }, [cancelOpen, discardOpen, publishOpen]);

  if (query.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          icon={Loader2}
          title={t("contributionRequests.detail.loadingTitle")}
          description={t("contributionRequests.detail.loadingDescription")}
        />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title={t("contributionRequests.detail.loadErrorTitle")}
          description={getContributionRequestErrorMessage(query.error)}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => void query.refetch()}>
                {t("common.retry")}
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/my-projects">{t("contributionRequests.detail.backToProjects")}</a>
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

  async function update(
    payload: ContributionRequestDraftPayload,
    skillRequirements?: ContributionRequestSkillRequirementInput[],
  ) {
    setSaved(false);
    setUpdateError(null);
    const idempotencyKey = updateIdempotency.current.getFor({
      requestId,
      payload,
    });
    try {
      await updateMutation.mutateAsync({ payload, idempotencyKey });
      if (skillRequirements && skillRequirements.length > 0) {
        try {
          await replaceContributionRequestSkillRequirements(
            requestId,
            skillRequirements,
          );
        } catch {
          // Non-blocking
        }
      }
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
      const hasRequiredSkill =
        Array.isArray(request.skillRequirements) &&
        request.skillRequirements.some((s) => s.kind === "required");

      if (!hasRequiredSkill) {
        const derived = resolveEffectiveSkillRequirements(
          toContributionRequestForm(request),
        );
        if (derived.length > 0) {
          try {
            await replaceContributionRequestSkillRequirements(
              requestId,
              derived,
            );
          } catch {
            // let publishMutation handle it
          }
        }
      }

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

  return (
    <PageContainer className="max-w-6xl">
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
              ? t("contributionRequests.detail.applicationsClosedSince", {
                  date: formatContributionDateTime(request.applicationsCloseTime),
                })
              : t(`contributionRequests.detail.lifecycle.${request.status}`)
          }
          actions={
            <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
              {statusMeta.label}
            </StatusChip>
          }
        />
      </div>

      <nav
        aria-label={t("contributionRequests.detail.sections")}
        className="mt-5 flex gap-1 overflow-x-auto border-b border-border"
      >
        <RequestTab
          icon={FileText}
          label={t("contributionRequests.detail.tabs.details")}
          selected={activeTab === "details"}
          onClick={() => handleTabChange("details")}
        />
        {request.status !== "draft" && request.status !== "discarded" && (
          <RequestTab
            icon={Users}
            label={t("contributionRequests.detail.tabs.applications")}
            selected={activeTab === "applications"}
            onClick={() => handleTabChange("applications")}
          />
        )}
        {matchingSlot && request.status === "published" && (
          <RequestTab
            icon={Sparkles}
            label={t("contributionRequests.detail.tabs.matches")}
            selected={activeTab === "matches"}
            onClick={() => handleTabChange("matches")}
          />
        )}
        {deliverySlot && (
          <RequestTab
            icon={GitPullRequest}
            label={t("contributionRequests.detail.tabs.delivery")}
            selected={activeTab === "delivery"}
            onClick={() => handleTabChange("delivery")}
          />
        )}
        {materialsSlot && (
          <RequestTab
            icon={Paperclip}
            label={t("contributionRequests.detail.tabs.materials")}
            selected={activeTab === "materials"}
            onClick={() => handleTabChange("materials")}
          />
        )}
      </nav>

      {activeTab === "details" &&
        (request.status === "discarded" ? (
          <Card className="mt-6 border-destructive/25 bg-destructive/5">
            <h2 className="text-lg font-bold text-foreground">
              {t("contributionRequests.detail.discardedTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("contributionRequests.detail.discardedDescription")}
            </p>
            <ReadOnlyRequest request={request} />
            <Button asChild variant="outline" className="mt-5">
              <a href={projectHref(request.projectId)}>{t("contributionRequests.detail.backToProject")}</a>
            </Button>
          </Card>
        ) : request.status === "cancelled" ? (
          <Card className="mt-6 border-destructive/25 bg-destructive/5">
            <h2 className="text-lg font-bold text-foreground">
              {t("contributionRequests.detail.cancelledTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("contributionRequests.detail.cancelledDescription")}
            </p>
            <ReadOnlyRequest request={request} />
            <Button asChild variant="outline" className="mt-5">
              <a href={projectHref(request.projectId)}>{t("contributionRequests.detail.backToProject")}</a>
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
                {t("contributionRequests.detail.saved")}
              </p>
            )}
            <ContributionRequestForm
              key={request.updatedAt}
              initialState={toContributionRequestForm(request)}
              isSubmitting={updateMutation.isPending}
              submitError={updateError}
              submitLabel={t("contributionRequests.detail.saveChanges")}
              cancelHref={projectHref(request.projectId)}
              onSubmit={update}
            />
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="font-bold text-foreground">{t("contributionRequests.detail.publishTitle")}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("contributionRequests.detail.publishDescription")}
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
                {t("contributionRequests.detail.publish")}
              </Button>
            </div>
            <div className="mt-6 border-t border-destructive/25 pt-5">
              <h2 className="font-bold text-foreground">{t("contributionRequests.detail.discardTitle")}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("contributionRequests.detail.discardDescription")}
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
                {t("contributionRequests.detail.discard")}
              </Button>
            </div>
          </Card>
        ) : request.status === "published" ? (
          <Card className="mt-6">
            <ReadOnlyRequest request={request} />
            {applicationsClosed && (
              <div
                role="status"
                className="mt-6 rounded-input border border-review-amber/30 bg-review-amber-soft p-4"
              >
                <h2 className="font-bold text-foreground">{t("contributionRequests.status.applicationsClosed")}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("contributionRequests.detail.applicationsClosedHelp")}
                </p>
              </div>
            )}
            <div className="mt-6 border-t border-destructive/25 pt-5">
              <h2 className="font-bold text-foreground">{t("contributionRequests.detail.cancelTitle")}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("contributionRequests.detail.cancelDescription")}
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
                {t("contributionRequests.detail.cancel")}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="mt-6">
            <h2 className="text-lg font-bold text-foreground">
              {t("contributionRequests.detail.readOnlyTitle")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("contributionRequests.detail.readOnlyDescription", { status: statusMeta.label })}
            </p>
            <ReadOnlyRequest request={request} />
            <Button asChild variant="outline" className="mt-5">
              <a href={projectHref(request.projectId)}>{t("contributionRequests.detail.backToProject")}</a>
            </Button>
          </Card>
        ))}

      {activeTab === "applications" &&
        request.status !== "draft" &&
        request.status !== "discarded" && (
          <OwnerApplicationReview contributionRequestId={request.id} />
        )}

      {activeTab === "matches" && matchingSlot && request.status === "published" && matchingSlot}

      {activeTab === "delivery" && deliverySlot && deliverySlot}

      {activeTab === "materials" && materialsSlot && (
        <div className="mt-5 max-h-[calc(100dvh-16rem)] overflow-y-auto rounded-card border border-border bg-card p-5">
          {materialsSlot}
        </div>
      )}

      {discardOpen && (
        <DiscardContributionRequestDialog
          isOpen
          isDiscarding={discardMutation.isPending}
          error={discardError}
          onCancel={() => {
            dialogReturnFocusRef.current = "discard-request-trigger";
            setDiscardOpen(false);
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
            dialogReturnFocusRef.current = "publish-request-trigger";
            setPublishOpen(false);
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
            dialogReturnFocusRef.current = "cancel-request-trigger";
            setCancelOpen(false);
          }}
          onConfirm={cancel}
        />
      )}
    </PageContainer>
  );
}

function RequestTab({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-4 text-sm transition-colors",
        selected
          ? "border-primary font-semibold text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function ReadOnlyRequest({
  request,
}: {
  request: NonNullable<ReturnType<typeof useContributionRequestQuery>["data"]>;
}) {
  const { t, i18n } = useTranslation();
  return (
    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
      {/*
        A draft generated from an accepted Proposal is what the owner edits and
        publishes. Without this the credit lived only on the proposal and
        vanished at the moment the work became public.
      */}
      {request.attribution && (
        <div className="sm:col-span-2 rounded-lg border border-border/60 bg-surface-fog p-3">
          <dt className="text-xs text-muted-foreground">
            {t("contributionRequests.detail.acceptedProposal")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm font-semibold text-foreground">
            <span>{request.attribution.contributorName}</span>
            {request.attribution.contributorUsername !== null && (
              <span
                dir="ltr"
                className="text-xs font-normal text-muted-foreground"
              >
                @{request.attribution.contributorUsername}
              </span>
            )}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("contributionRequests.detail.attributionHelp")}
          </p>
        </div>
      )}
      <ReadOnlyField
        label={t("contributionRequests.form.description")}
        value={request.description}
        className="sm:col-span-2"
      />
      <ReadOnlyField
        label={t("contributionRequests.form.requiredRequirements")}
        value={new Intl.ListFormat(i18n.language).format(
          request.requiredRequirements.map((item) => item.text),
        )}
      />
      <ReadOnlyField
        label={t("contributionRequests.form.preferredRequirements")}
        value={
          new Intl.ListFormat(i18n.language).format(
            request.preferredRequirements.map((item) => item.text),
          ) ||
          t("contributionRequests.unspecified")
        }
      />
      {/*
        Owner pages were printing the raw ISO string, so an owner who entered
        12:00 read back 2030-06-15T09:00:00.000Z -- the right instant, but it
        looks like the deadline moved. The contributor pages already used these
        formatters, which render in the reader's own timezone.
      */}
      <ReadOnlyField
        label={t("contributionRequests.form.closeTime")}
        value={formatContributionDateTime(request.applicationsCloseTime)}
      />
      <ReadOnlyField
        label={t("contributionRequests.form.targetDate")}
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
