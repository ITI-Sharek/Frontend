import { ExternalLink, FolderOpen, UserRoundCheck } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { useAdminPublishedProjectOwnersQuery } from "../api/queries/use-admin-published-project-owners-query";

export function AdminPublishedProjectOwnersPanel() {
  const publishedOwners = useAdminPublishedProjectOwnersQuery();

  return (
    <section
      aria-labelledby="published-project-owners-heading"
      className="overflow-hidden rounded-card border border-border bg-card"
    >
      <div className="grid gap-5 border-b border-border p-5 sm:grid-cols-[1fr_auto] sm:items-start md:p-6">
        <div>
          <h2
            id="published-project-owners-heading"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <FolderOpen className="size-5 text-primary" aria-hidden="true" />
            ملاك لديهم مشاريع منشورة
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            أحدث ملاك المشاريع المنشورة، مع عدد مشاريع كل مالك وآخر مشروع نشره.
          </p>
        </div>
        <div className="text-start sm:min-w-28 sm:text-end">
          <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
            {publishedOwners.isPending ? "…" : (publishedOwners.data?.length ?? 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">مالك ظاهر</p>
        </div>
      </div>

      {publishedOwners.isPending ? (
        <p role="status" aria-live="polite" className="p-6 text-sm text-muted-foreground">
          جارٍ تحميل ملاك المشاريع المنشورة…
        </p>
      ) : publishedOwners.isError ? (
        <div role="alert" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="font-semibold text-foreground">تعذر تحميل ملاك المشاريع</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أعد المحاولة دون التأثير في طابور مراجعة المهارات.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void publishedOwners.refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : publishedOwners.data.length ? (
        <div className="divide-y divide-border">
          {publishedOwners.data.map((owner) => (
            <article
              key={owner.ownerId}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(12rem,auto)] sm:items-center md:px-6"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-semibold text-foreground">
                  <UserRoundCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  {owner.ownerName || owner.ownerEmail}
                </p>
                <p
                  dir="ltr"
                  className="mt-1 truncate text-left text-xs text-muted-foreground"
                >
                  {owner.ownerEmail}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {owner.publishedProjectsCount}
                </span>{" "}
                مشروع منشور
              </p>
              <div className="min-w-0 sm:text-end">
                <a
                  href={owner.latestProject.githubRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 max-w-full items-center gap-2 font-semibold text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="truncate">{owner.latestProject.title}</span>
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">يفتح مستودع المشروع في نافذة جديدة</span>
                </a>
                {owner.latestPublishedAt && (
                  <p className="text-xs text-muted-foreground">
                    آخر نشر:{" "}
                    <time dateTime={owner.latestPublishedAt}>
                      {formatPublishedDate(owner.latestPublishedAt)}
                    </time>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-3 p-5 md:p-6">
          <FolderOpen className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">لا توجد مشاريع منشورة</p>
            <p className="mt-1 text-sm text-muted-foreground">
              سيظهر هنا الملاك بعد نشر أول مشروع تدعمه العقود الحالية.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function formatPublishedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "غير معروف";
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
