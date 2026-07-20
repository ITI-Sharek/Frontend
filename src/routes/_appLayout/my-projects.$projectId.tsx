import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Archive, CircleCheck, FileText, Plus } from "lucide-react";

import { requireOwnerRoute } from "@/modules/auth";
import { getMyProjects } from "@/modules/projects";
import type { MyProjectDto } from "@/modules/projects";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

const STATUS_META = {
  draft: { tone: "neutral" as const, icon: FileText, label: "مسودة" },
  published: { tone: "positive" as const, icon: CircleCheck, label: "منشور" },
  archived: { tone: "neutral" as const, icon: Archive, label: "مؤرشف" },
};

export const Route = createFileRoute("/_appLayout/my-projects/$projectId")({
  beforeLoad: requireOwnerRoute,
  head: () => ({ meta: [{ title: "إدارة المشروع | Sharek" }] }),
  component: OwnerProjectManagementPage,
});

function OwnerProjectManagementPage() {
  const { projectId } = Route.useParams();
  const projectsQuery = useQuery({
    queryKey: ["projects", "mine"],
    queryFn: getMyProjects,
  });

  if (projectsQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">جارٍ تحميل المشروع...</p>
      </div>
    );
  }

  if (projectsQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm leading-6 text-destructive">
          {getApiErrorMessage(
            projectsQuery.error,
            "تعذر تحميل بيانات المشروع — حاول مرة أخرى.",
          )}
        </p>
      </div>
    );
  }

  const project = projectsQuery.data.projects.find(
    (item) => item.id === projectId,
  );

  if (!project) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-foreground">
          لم نعثر على هذا المشروع
        </h1>
        <p className="text-sm text-muted-foreground">
          ربما أُزيل المشروع أو لا يخص هذا الحساب.
        </p>
        <Button asChild size="sm">
          <a href="/my-projects">العودة إلى مشاريعي</a>
        </Button>
      </div>
    );
  }

  return <OwnerProjectManagementView project={project} />;
}

function OwnerProjectManagementView({ project }: { project: MyProjectDto }) {
  const meta = STATUS_META[project.status];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <a href="/my-projects" className="text-sm text-muted-foreground">
            مشاريعي
          </a>
          <h1
            dir="ltr"
            className="mt-1 truncate text-end font-mono text-2xl font-bold tracking-[0.65px] text-foreground"
          >
            {project.title}
          </h1>
        </div>
        <StatusChip tone={meta.tone} icon={meta.icon}>
          {meta.label}
        </StatusChip>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="طلبات مساهمة مفتوحة" value={project.openRequestsCount} />
        <Metric
          label="طلبات انضمام معلقة"
          value={project.pendingApplicationsCount}
        />
        <Metric label="آخر نشاط" value={project.lastActivityLabel} />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              طلبات المساهمة
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              هذه الصفحة جاهزة لإدارة مشروعك. إنشاء وتعديل طلبات المساهمة
              سيُربط هنا عند اكتمال واجهة طلبات المساهمة.
            </p>
          </div>
          <Button size="sm" disabled>
            <Plus className="size-4" />
            إنشاء طلب مساهمة
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
