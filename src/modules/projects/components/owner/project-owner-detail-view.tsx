import {
  Archive,
  ArchiveRestore,
  CircleCheck,
  ExternalLink,
  FileText,
  Loader2,
  Rocket,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { cn } from "@/lib/utils";

import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "../explore-filters";
import { ProjectSourceStatusPanel } from "./project-source-status-panel";
import {
  formatFieldList,
  parseFieldList,
} from "../../utils/project-field-list";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../../types/project.types";
import type {
  EditProjectPayload,
  ProjectManualOverrideField,
  ProjectOwnerViewDto,
} from "../../types/project-draft.types";

const STATUS_META = {
  draft: { tone: "neutral" as const, icon: FileText, label: "مسودة" },
  published: { tone: "positive" as const, icon: CircleCheck, label: "منشور" },
  archived: { tone: "neutral" as const, icon: Archive, label: "مؤرشف" },
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as ProjectDifficulty[];

interface ProjectOwnerDetailViewProps {
  project: ProjectOwnerViewDto;
  myProjectsHref: string;
  publicProjectHref: string;
  onSaveEdit: (payload: EditProjectPayload) => void;
  isSavingEdit: boolean;
  editError: string | null;
  onRestoreField: (field: ProjectManualOverrideField) => void;
  restoringField: ProjectManualOverrideField | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshError: string | null;
  onPublish: () => void;
  isPublishing: boolean;
  publishError: string | null;
  onArchive: () => void;
  isArchiving: boolean;
  archiveError: string | null;
  recoverySlot?: ReactNode;
}

/**
 * SK-112 owner project management surface: source status/refresh, owner-field
 * review/edit with per-field restore-from-source, and the explicit
 * publish/archive transitions. Keyed by revision at the call site so local
 * edit state re-syncs after every successful mutation.
 */
export function ProjectOwnerDetailView({
  project,
  myProjectsHref,
  publicProjectHref,
  onSaveEdit,
  isSavingEdit,
  editError,
  onRestoreField,
  restoringField,
  onRefresh,
  isRefreshing,
  refreshError,
  onPublish,
  isPublishing,
  publishError,
  onArchive,
  isArchiving,
  archiveError,
  recoverySlot,
}: ProjectOwnerDetailViewProps) {
  const statusMeta = STATUS_META[project.status];
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <a href={myProjectsHref} className="text-sm text-muted-foreground">
            مشاريعي
          </a>
          <h1
            dir="ltr"
            className="mt-1 truncate text-end font-mono text-2xl font-bold tracking-[0.65px] text-foreground"
          >
            {project.project.title || "بلا عنوان"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            الإصدار #{project.revision}
          </p>
        </div>
        <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
          {statusMeta.label}
        </StatusChip>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ProjectEditForm
          key={project.revision}
          project={project}
          onSaveEdit={onSaveEdit}
          isSavingEdit={isSavingEdit}
          editError={editError}
          onRestoreField={onRestoreField}
          restoringField={restoringField}
        />

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ProjectSourceStatusPanel
            attribution={project.source.attribution}
            status={project.source.status}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            refreshError={refreshError}
            recoverySlot={recoverySlot}
          />

          {project.status === "draft" && (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-foreground">النشر</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                بعد النشر يظهر المشروع لكل المساهمين. يمكنك أرشفته لاحقاً في أي
                وقت، لكن لا يمكن إعادته إلى مسودة.
              </p>
              {publishError && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  {publishError}
                </p>
              )}
              {!confirmingPublish ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  onClick={() => setConfirmingPublish(true)}
                >
                  <Rocket className="size-4" />
                  نشر المشروع
                </Button>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPublishing}
                    onClick={() => {
                      onPublish();
                    }}
                  >
                    {isPublishing && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    تأكيد النشر
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPublishing}
                    onClick={() => setConfirmingPublish(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </Card>
          )}

          {project.status === "published" && (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-foreground">الأرشفة</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                الأرشفة تزيل المشروع من كل القوائم العامة. هذا الإجراء الوحيد
                لسحب مشروع منشور، ولا يمكن التراجع عنه إلى مسودة.
              </p>
              <Button asChild type="button" size="sm" className="mt-3">
                <a href={publicProjectHref}>
                  <ExternalLink className="size-4" />
                  عرض الصفحة العامة
                </a>
              </Button>
              {archiveError && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  {archiveError}
                </p>
              )}
              {!confirmingArchive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setConfirmingArchive(true)}
                >
                  <ArchiveRestore className="size-4" />
                  أرشفة المشروع
                </Button>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isArchiving}
                    onClick={() => {
                      onArchive();
                    }}
                  >
                    {isArchiving && <Loader2 className="size-4 animate-spin" />}
                    تأكيد الأرشفة
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isArchiving}
                    onClick={() => setConfirmingArchive(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </Card>
          )}

          {project.status === "archived" && (
            <Card className="border-border/60 bg-surface-fog p-5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                هذا المشروع مؤرشف وغير مرئي للعامة. إعادة النشر أو التفعيل غير
                متاحة من هذه الصفحة حالياً.
              </p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function ProjectEditForm({
  project,
  onSaveEdit,
  isSavingEdit,
  editError,
  onRestoreField,
  restoringField,
}: {
  project: ProjectOwnerViewDto;
  onSaveEdit: (payload: EditProjectPayload) => void;
  isSavingEdit: boolean;
  editError: string | null;
  onRestoreField: (field: ProjectManualOverrideField) => void;
  restoringField: ProjectManualOverrideField | null;
}) {
  const effective = project.project;
  const [title, setTitle] = useState(effective.title);
  const [description, setDescription] = useState(effective.description ?? "");
  const [tags, setTags] = useState(formatFieldList(effective.tags));
  const [technologies, setTechnologies] = useState(
    formatFieldList(effective.technologies),
  );
  const [category, setCategory] = useState(effective.category);
  const [difficulty, setDifficulty] = useState(effective.difficulty);

  const isManual = (field: ProjectManualOverrideField) =>
    effective.manualOverrides.includes(field);

  function buildEditPayload(): EditProjectPayload | null {
    const payload: EditProjectPayload = { expectedRevision: project.revision };
    let hasChange = false;

    if (title !== effective.title) {
      payload.title = title;
      hasChange = true;
    }
    const normalizedDescription =
      description.trim() === "" ? null : description;
    if (normalizedDescription !== effective.description) {
      payload.description = normalizedDescription;
      hasChange = true;
    }
    const normalizedTags = parseFieldList(tags);
    if (normalizedTags.join(",") !== effective.tags.join(",")) {
      payload.tags = normalizedTags;
      hasChange = true;
    }
    const normalizedTechnologies = parseFieldList(technologies);
    if (normalizedTechnologies.join(",") !== effective.technologies.join(",")) {
      payload.technologies = normalizedTechnologies;
      hasChange = true;
    }
    if (category !== effective.category) {
      payload.category = category;
      hasChange = true;
    }
    if (difficulty !== effective.difficulty) {
      payload.difficulty = difficulty;
      hasChange = true;
    }

    return hasChange ? payload : null;
  }

  const pendingPayload = buildEditPayload();

  return (
    <Card>
      <h2 className="text-sm font-bold text-foreground">بيانات المشروع</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        الحقول المعلَّمة «من GitHub» تُحدَّث تلقائياً عند التحديث ما لم تعدّلها.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <EditFieldLabel
          label="العنوان"
          isManual={isManual("title")}
          onRestore={() => onRestoreField("title")}
          isRestoring={restoringField === "title"}
        >
          <Input
            dir="ltr"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </EditFieldLabel>

        <EditFieldLabel
          label="الوصف"
          isManual={isManual("description")}
          onRestore={() => onRestoreField("description")}
          isRestoring={restoringField === "description"}
        >
          <textarea
            dir="rtl"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-sm text-foreground outline-none"
          />
        </EditFieldLabel>

        <EditFieldLabel
          label="الوسوم"
          hint="مفصولة بفواصل"
          isManual={isManual("tags")}
          onRestore={() => onRestoreField("tags")}
          isRestoring={restoringField === "tags"}
        >
          <Input
            dir="ltr"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </EditFieldLabel>

        <EditFieldLabel
          label="التقنيات"
          hint="مفصولة بفواصل"
          isManual={isManual("technologies")}
          onRestore={() => onRestoreField("technologies")}
          isRestoring={restoringField === "technologies"}
        >
          <Input
            dir="ltr"
            value={technologies}
            onChange={(event) => setTechnologies(event.target.value)}
          />
        </EditFieldLabel>

        <EditFieldLabel label="التصنيف" hint="مطلوب قبل النشر">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((item) => (
              <PillOption
                key={item}
                label={CATEGORY_LABELS[item]}
                selected={category === item}
                onSelect={() => setCategory(item)}
              />
            ))}
          </div>
        </EditFieldLabel>

        <EditFieldLabel label="مستوى الصعوبة" hint="مطلوب قبل النشر">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((item) => (
              <PillOption
                key={item}
                label={DIFFICULTY_LABELS[item]}
                selected={difficulty === item}
                onSelect={() => setDifficulty(item)}
              />
            ))}
          </div>
        </EditFieldLabel>
      </div>

      {editError && (
        <p role="alert" className="mt-4 text-sm leading-6 text-destructive">
          {editError}
        </p>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <Button
          type="button"
          size="sm"
          disabled={isSavingEdit || pendingPayload === null}
          onClick={() => {
            if (pendingPayload) onSaveEdit(pendingPayload);
          }}
        >
          {isSavingEdit && <Loader2 className="size-4 animate-spin" />}
          حفظ التعديلات
        </Button>
      </div>
    </Card>
  );
}

function EditFieldLabel({
  label,
  hint,
  isManual,
  onRestore,
  isRestoring,
  children,
}: {
  label: string;
  hint?: string;
  isManual?: boolean;
  onRestore?: () => void;
  isRestoring?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {hint && (
          <span className="text-[11px] font-normal text-muted-foreground">
            — {hint}
          </span>
        )}
        {isManual && onRestore && (
          <button
            type="button"
            disabled={isRestoring}
            onClick={onRestore}
            className="rounded-full bg-border/50 px-2 py-0.5 font-mono text-[10px] tracking-[0.65px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {isRestoring ? "جارٍ الاستعادة..." : "استعادة من GitHub"}
          </button>
        )}
      </span>
      {children}
    </div>
  );
}

function PillOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
