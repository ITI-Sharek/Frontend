import { Archive, CircleCheck, FileText, FolderGit2, Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";

import type {
  CursorPageInfoDto,
  MyProjectSummaryDto,
  OwnerQuotaDto,
} from "../../types/my-projects.types";

const STATUS_META = {
  draft: { tone: "neutral" as const, icon: FileText, label: "مسودة" },
  published: { tone: "positive" as const, icon: CircleCheck, label: "منشور" },
  archived: { tone: "neutral" as const, icon: Archive, label: "مؤرشف" },
};

/**
 * OJ-1 owner portfolio (screen-inventory §4.2): rows with status + pipeline
 * counts; empty state is the first-import hero. Backed by cursor-paginated
 * `GET /projects/me`.
 */
export function MyProjectsList({
  projects,
  quota,
  pageInfo,
  importHref,
  onProjectHref,
  onLoadMore,
  isLoadingMore = false,
}: {
  projects: MyProjectSummaryDto[];
  quota: OwnerQuotaDto;
  pageInfo: CursorPageInfoDto;
  importHref: string;
  onProjectHref: (projectId: string) => string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مشاريعي</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {quota.used} من {quota.monthlyLimit} طلب مساهمة هذا الشهر
          </p>
        </div>
        <Button asChild size="sm">
          <a href={importHref}>
            <Plus className="size-4" />
            استيراد مشروع
          </a>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-border bg-card p-12 text-center">
          <FolderGit2 className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-bold text-foreground">
            استورد مشروعك الأول من GitHub
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
            نجلب البيانات تلقائيًا من المستودع، تراجعها وتنشرها — ثم تنشئ طلبات
            مساهمة يراها مساهمون مؤهلون.
          </p>
          <Button asChild size="sm" className="mt-4">
            <a href={importHref}>
              <Plus className="size-4" />
              استيراد مشروع
            </a>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-5 divide-y divide-border rounded-card border border-border bg-card">
            {projects.map((project) => {
              const meta = STATUS_META[project.status];
              return (
                <div
                  key={project.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p dir="ltr" className="text-end font-mono text-[14px] font-bold tracking-[0.65px] text-foreground">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.openRequestsCount} طلبات مساهمة مفتوحة ·{" "}
                      {project.pendingApplicationsCount} طلبات بانتظار قرارك · آخر
                      نشاط {project.lastActivityLabel}
                    </p>
                  </div>
                  <StatusChip tone={meta.tone} icon={meta.icon}>
                    {meta.label}
                  </StatusChip>
                  <Button asChild size="sm" variant="outline">
                    <a href={onProjectHref(project.id)}>إدارة</a>
                  </Button>
                </div>
              );
            })}
          </div>

          {pageInfo.hasNextPage && onLoadMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={onLoadMore}
              >
                {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                تحميل المزيد
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
