import { Link } from "@tanstack/react-router";
import { CircleAlert, FilePlus2, Loader2 } from "lucide-react";

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
  | keyof ContributionRequestsByStatusDto
  | "applicationsClosed";

const SECTION_ORDER: Array<{
  status: OwnerSectionStatus;
  title: string;
  alwaysShown: boolean;
}> = [
  { status: "published", title: "منشور", alwaysShown: true },
  { status: "applicationsClosed", title: "التقديم مغلق", alwaysShown: false },
  { status: "draft", title: "مسودات", alwaysShown: true },
  { status: "assigned", title: "مُسنَد", alwaysShown: false },
  { status: "completed", title: "مكتمل", alwaysShown: false },
  { status: "cancelled", title: "مُلغى", alwaysShown: false },
  { status: "discarded", title: "متجاهل", alwaysShown: false },
];

export function OwnerContributionRequestsWorkspace({
  projectId,
  projectTitle,
  canCreate,
  requestHref,
  newRequestHref,
}: {
  projectId: string;
  projectTitle: string;
  canCreate: boolean;
  requestHref: (requestId: string) => string;
  newRequestHref: string;
}) {
  const query = useOwnerProjectContributionRequestsQuery(projectId);

  if (query.isPending) {
    return (
      <PageContainer>
        <PageFeedback
          icon={Loader2}
          title="جارٍ تحميل طلبات المساهمة"
          description="نسترجع طلبات هذا المشروع من كل الحالات."
        />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageFeedback
          icon={CircleAlert}
          title="تعذر تحميل طلبات المساهمة"
          description={getContributionRequestErrorMessage(query.error)}
          action={
            <Button size="sm" onClick={() => void query.refetch()}>
              إعادة المحاولة
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
        title={`طلبات المساهمة — ${projectTitle}`}
        description="كل طلبات المساهمة لهذا المشروع مجمّعة حسب حالتها، مع توضيح الطلبات التي أُغلق التقديم عليها."
        actions={
          canCreate ? (
            <Button asChild size="sm">
              <Link to={newRequestHref}>
                <FilePlus2 className="size-4" aria-hidden="true" />
                طلب مساهمة جديد
              </Link>
            </Button>
          ) : undefined
        }
      />

      {totalCount === 0 ? (
        <PageFeedback
          className="mt-6"
          icon={FilePlus2}
          title="لا توجد طلبات مساهمة بعد"
          description={
            canCreate
              ? "أنشئ أول طلب مساهمة لهذا المشروع."
              : "انشر المشروع أولًا لتتمكن من إنشاء طلب مساهمة."
          }
          action={
            canCreate ? (
              <Button asChild size="sm">
                <Link to={newRequestHref}>إنشاء طلب مساهمة</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {SECTION_ORDER.map(({ status, title, alwaysShown }) => {
            const items = getSectionItems(status, byStatus, now);
            if (items.length === 0 && !alwaysShown) return null;
            return (
              <ContributionRequestSection
                key={status}
                title={title}
                items={items}
                requestHref={requestHref}
                now={now}
              />
            );
          })}
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
          لا توجد طلبات في هذه الحالة.
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
  const applicationsClosed = isContributionRequestApplicationsClosed(
    request,
    now,
  );
  const statusMeta = getOwnerContributionRequestStatusMeta(request, now);
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-card border bg-card p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] transition-colors hover:border-primary/40 dark:shadow-[0_8px_16px_rgba(0,0,0,0.37)]",
        applicationsClosed
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border",
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">
          {request.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {request.applicationsCloseTime
            ? `${applicationsClosed ? "أُغلق التقديم" : "إغلاق التقديم"}: ${formatContributionDateTime(request.applicationsCloseTime)}`
            : "لم يُحدَّد وقت إغلاق التقديم"}
        </p>
        {applicationsClosed && (
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            لا يستقبل طلبات تقديم جديدة، والطلبات السابقة محفوظة للمراجعة.
          </p>
        )}
      </div>
      <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
        {statusMeta.label}
      </StatusChip>
    </Link>
  );
}
