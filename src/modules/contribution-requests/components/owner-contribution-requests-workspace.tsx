import { Link } from "@tanstack/react-router";
import { CircleAlert, FilePlus2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import {
  PageContainer,
  PageFeedback,
  PageHeader,
} from "@/shared/components/layout/page-layout";

import { getContributionRequestErrorMessage } from "../constants/contribution-request-copy";
import { useOwnerProjectContributionRequestsQuery } from "../api/queries/use-owner-project-contribution-requests-query";
import {
  getOwnerContributionRequestStatusMeta,
  isContributionRequestApplicationsClosed,
} from "../utils/contribution-request-status";
import { formatContributionDateTime } from "../utils/contributor-presentation";
import type {
  ContributionRequestDto,
  ContributionRequestsByStatusDto,
} from "../types/contribution-request.types";

type OwnerSectionStatus =
  keyof ContributionRequestsByStatusDto | "applicationsClosed";

const SECTION_ORDER: Array<{
  status: OwnerSectionStatus;
  titleKey: string;
  alwaysShown: boolean;
}> = [
  { status: "published", titleKey: "published", alwaysShown: true },
  { status: "applicationsClosed", titleKey: "applicationsClosed", alwaysShown: false },
  { status: "draft", titleKey: "drafts", alwaysShown: true },
  { status: "assigned", titleKey: "assigned", alwaysShown: false },
  { status: "completed", titleKey: "completed", alwaysShown: false },
  { status: "cancelled", titleKey: "cancelled", alwaysShown: false },
  { status: "discarded", titleKey: "discarded", alwaysShown: false },
];

export function OwnerContributionRequestsWorkspace({
  projectId,
  projectTitle,
  canCreate,
  requestHref,
  newRequestHref,
  onCreateRequest,
}: {
  projectId: string;
  projectTitle: string;
  canCreate: boolean;
  requestHref: (requestId: string) => string;
  newRequestHref: string;
  onCreateRequest?: () => void;
}) {
  const { t } = useTranslation();
  const query = useOwnerProjectContributionRequestsQuery(projectId);
  const [activeStatus, setActiveStatus] =
    useState<OwnerSectionStatus>("published");

  if (query.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          icon={Loader2}
          title={t("contributionRequests.ownerWorkspace.loadingTitle")}
          description={t("contributionRequests.ownerWorkspace.loadingDescription")}
        />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title={t("contributionRequests.ownerWorkspace.loadErrorTitle")}
          description={getContributionRequestErrorMessage(query.error)}
          action={
            <Button size="sm" onClick={() => void query.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const { totalCount, byStatus } = query.data;
  const now = new Date();

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title={t("contributionRequests.ownerWorkspace.title", { project: projectTitle })}
        description={t("contributionRequests.ownerWorkspace.description")}
        actions={
          canCreate ? (
            onCreateRequest ? (
              <Button size="sm" onClick={onCreateRequest}>
                <FilePlus2 className="size-4" aria-hidden="true" />
                {t("contributionRequests.ownerWorkspace.newRequest")}
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to={newRequestHref}>
                  <FilePlus2 className="size-4" aria-hidden="true" />
                  {t("contributionRequests.ownerWorkspace.newRequest")}
                </Link>
              </Button>
            )
          ) : undefined
        }
      />

      {totalCount === 0 ? (
        <PageFeedback
          className="mt-6"
          icon={FilePlus2}
          title={t("contributionRequests.ownerWorkspace.emptyTitle")}
          description={
            canCreate
              ? t("contributionRequests.ownerWorkspace.canCreateDescription")
              : t("contributionRequests.ownerWorkspace.cannotCreateDescription")
          }
          action={
            canCreate ? (
              onCreateRequest ? (
                <Button size="sm" onClick={onCreateRequest}>
                  {t("contributionRequests.ownerWorkspace.createRequest")}
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to={newRequestHref}>{t("contributionRequests.ownerWorkspace.createRequest")}</Link>
                </Button>
              )
            ) : undefined
          }
        />
      ) : (
        <div className="mt-6">
          <div
            role="tablist"
            aria-label={t("contributionRequests.ownerWorkspace.statuses")}
            className="flex gap-1 overflow-x-auto border-b border-border pb-px"
          >
            {SECTION_ORDER.map(({ status, titleKey, alwaysShown }) => {
              const count = getSectionItems(status, byStatus, now).length;
              if (count === 0 && !alwaysShown) return null;
              const selected = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveStatus(status)}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
                    selected
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`contributionRequests.ownerWorkspace.sections.${titleKey}`)}
                  <span className="rounded-full bg-surface-fog px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            className="max-h-[calc(100dvh-19rem)] min-h-72 overflow-y-auto overscroll-contain pt-5 pe-1"
          >
            <ContributionRequestSection
              title={
                SECTION_ORDER.find((section) => section.status === activeStatus)
                  ? t(`contributionRequests.ownerWorkspace.sections.${SECTION_ORDER.find((section) => section.status === activeStatus)?.titleKey}`)
                  : t("contributionRequests.ownerWorkspace.requests")
              }
              items={getSectionItems(activeStatus, byStatus, now)}
              requestHref={requestHref}
              now={now}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function getSectionItems(
  status: OwnerSectionStatus,
  byStatus: ContributionRequestsByStatusDto,
  now: Date,
): ContributionRequestDto[] {
  if (status === "applicationsClosed") {
    return byStatus.published.filter((request) =>
      isContributionRequestApplicationsClosed(request, now),
    );
  }

  if (status === "published") {
    return byStatus.published.filter(
      (request) => !isContributionRequestApplicationsClosed(request, now),
    );
  }

  return byStatus[status];
}

function ContributionRequestSection({
  title,
  items,
  requestHref,
  now,
}: {
  title: string;
  items: ContributionRequestDto[];
  requestHref: (requestId: string) => string;
  now: Date;
}) {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="text-sm font-bold text-foreground">
        {title}{" "}
        <span className="font-normal text-muted-foreground">
          ({items.length})
        </span>
      </h2>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("contributionRequests.ownerWorkspace.emptySection")}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {items.map((request) => (
            <li key={request.id}>
              <ContributionRequestRow
                request={request}
                href={requestHref(request.id)}
                now={now}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ContributionRequestRow({
  request,
  href,
  now,
}: {
  request: ContributionRequestDto;
  href: string;
  now: Date;
}) {
  const { t } = useTranslation();
  const applicationsClosed = isContributionRequestApplicationsClosed(
    request,
    now,
  );
  const statusMeta = getOwnerContributionRequestStatusMeta(request, now);
  return (
    <Link
      to={href}
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] transition-colors hover:border-primary/40 dark:shadow-[0_4px_24px_rgba(0,0,0,0.45),0_1px_3px_rgba(0,0,0,0.3)]"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {request.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.applicationsCloseTime
            ? t(applicationsClosed ? "contributionRequests.ownerWorkspace.closedAt" : "contributionRequests.ownerWorkspace.closeAt", { date: formatContributionDateTime(request.applicationsCloseTime) })
            : t("contributionRequests.ownerWorkspace.noCloseTime")}
        </p>
        {applicationsClosed && (
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            {t("contributionRequests.ownerWorkspace.closedHelp")}
          </p>
        )}
      </div>
      <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
        {statusMeta.label}
      </StatusChip>
    </Link>
  );
}
