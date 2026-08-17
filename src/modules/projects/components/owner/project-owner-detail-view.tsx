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
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { cn } from "@/lib/utils";

import {
  getCategoryLabel,
  getDifficultyLabel,
  PROJECT_CATEGORIES,
  PROJECT_DIFFICULTIES,
} from "../explore-filters";
import { ProjectSourceStatusPanel } from "./project-source-status-panel";
import { formatFieldList, parseFieldList } from "../../utils/project-field-list";
import type {
  EditProjectPayload,
  ProjectManualOverrideField,
  ProjectOwnerViewDto,
} from "../../types/project-draft.types";

const STATUS_META = {
  draft: { tone: "neutral" as const, icon: FileText, labelKey: "project.myProjectsList.statusDraft" },
  published: { tone: "positive" as const, icon: CircleCheck, labelKey: "project.myProjectsList.statusPublished" },
  archived: { tone: "neutral" as const, icon: Archive, labelKey: "project.myProjectsList.statusArchived" },
};

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
  const { t } = useTranslation();
  const statusMeta = STATUS_META[project.status];
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <a href={myProjectsHref} className="text-sm text-muted-foreground">
            {t("project.owner.myProjects")}
          </a>
          <h1
            dir="ltr"
            className="mt-1 truncate text-end font-mono text-2xl font-bold tracking-[0.65px] text-foreground"
          >
            {project.project.title || t("project.detail.noTitle")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("project.owner.revision", { revision: project.revision })}
          </p>
        </div>
        <StatusChip tone={statusMeta.tone} icon={statusMeta.icon}>
          {t(statusMeta.labelKey)}
        </StatusChip>
      </div>

      <ProjectSourceStatusPanel
        attribution={project.source.attribution}
        status={project.source.status}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        refreshError={refreshError}
        recoverySlot={recoverySlot}
      />

      <ProjectEditForm
        key={project.revision}
        project={project}
        onSaveEdit={onSaveEdit}
        isSavingEdit={isSavingEdit}
        editError={editError}
        onRestoreField={onRestoreField}
        restoringField={restoringField}
      />

      {project.status === "draft" && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">{t("project.owner.publishTitle")}</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("project.owner.publishDescription")}
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
              {t("project.owner.publishProject")}
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
                {isPublishing && <Loader2 className="size-4 animate-spin" />}
                {t("project.owner.confirmPublish")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPublishing}
                onClick={() => setConfirmingPublish(false)}
              >
                {t("common.cancel")}
              </Button>
            </div>
          )}
        </Card>
      )}

      {project.status === "published" && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">{t("project.owner.archiveTitle")}</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t("project.owner.archiveDescription")}
          </p>
          <Button asChild type="button" size="sm" className="mt-3">
            <a href={publicProjectHref}>
              <ExternalLink className="size-4" />
              {t("project.owner.viewPublicPage")}
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
              {t("project.owner.archiveProject")}
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
                {t("project.owner.confirmArchive")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isArchiving}
                onClick={() => setConfirmingArchive(false)}
              >
                {t("common.cancel")}
              </Button>
            </div>
          )}
        </Card>
      )}

      {project.status === "archived" && (
        <Card className="border-border/60 bg-surface-fog">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("project.owner.archivedNote")}
          </p>
        </Card>
      )}
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
  const { t } = useTranslation();
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
    const normalizedDescription = description.trim() === "" ? null : description;
    if (normalizedDescription !== effective.description) {
      payload.description = normalizedDescription;
      hasChange = true;
    }
    const normalizedTags = parseFieldList(tags);
    if (
      normalizedTags.join(",") !== effective.tags.join(",")
    ) {
      payload.tags = normalizedTags;
      hasChange = true;
    }
    const normalizedTechnologies = parseFieldList(technologies);
    if (
      normalizedTechnologies.join(",") !== effective.technologies.join(",")
    ) {
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
      <h2 className="text-sm font-bold text-foreground">{t("project.owner.projectData")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("project.owner.githubFieldNote")}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <EditFieldLabel
          label={t("project.fields.title")}
          isManual={isManual("title")}
          onRestore={() => onRestoreField("title")}
          isRestoring={restoringField === "title"}
        >
          <Input dir="ltr" value={title} onChange={(event) => setTitle(event.target.value)} />
        </EditFieldLabel>

        <EditFieldLabel
          label={t("project.fields.description")}
          isManual={isManual("description")}
          onRestore={() => onRestoreField("description")}
          isRestoring={restoringField === "description"}
        >
          <Textarea
            dir="rtl"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="text-right"
          />
        </EditFieldLabel>

        <EditFieldLabel
          label={t("project.fields.tags")}
          hint={t("project.fields.commaSeparated")}
          isManual={isManual("tags")}
          onRestore={() => onRestoreField("tags")}
          isRestoring={restoringField === "tags"}
        >
          <Input dir="ltr" value={tags} onChange={(event) => setTags(event.target.value)} />
        </EditFieldLabel>

        <EditFieldLabel
          label={t("project.fields.technologies")}
          hint={t("project.fields.commaSeparated")}
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

        <EditFieldLabel label={t("project.fields.category")} hint={t("project.fields.requiredBeforePublish")}>
          <div className="flex flex-wrap gap-2">
            {PROJECT_CATEGORIES.map((item) => (
              <PillOption
                key={item}
                label={getCategoryLabel(t, item)}
                selected={category === item}
                onSelect={() => setCategory(item)}
              />
            ))}
          </div>
        </EditFieldLabel>

        <EditFieldLabel label={t("project.fields.difficulty")} hint={t("project.fields.requiredBeforePublish")}>
          <div className="flex flex-wrap gap-2">
            {PROJECT_DIFFICULTIES.map((item) => (
              <PillOption
                key={item}
                label={getDifficultyLabel(t, item)}
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
          {t("project.owner.saveEdits")}
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
  const { t } = useTranslation();
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
            {isRestoring ? t("project.owner.restoring") : t("project.owner.restoreFromGithub")}
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
