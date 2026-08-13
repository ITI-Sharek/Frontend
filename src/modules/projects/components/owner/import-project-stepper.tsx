import { AlertTriangle, Loader2, Lock, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { StepIndicator } from "@/shared/components/navigation/step-indicator";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";
import { cn } from "@/lib/utils";

import { useCreateProjectDraftMutation } from "../../api/mutations/use-create-project-draft-mutation";
import { usePreviewGitHubRepositoryMutation } from "../../api/mutations/use-preview-github-repository-mutation";
import {
  getProjectApiErrorMessage,
  isPreviewStaleError,
} from "../../utils/project-error-presenter";
import { formatFieldList, parseFieldList } from "../../utils/project-field-list";
import { getOwnerTypeLabel } from "../../utils/project-source-presenter";
import {
  getCategoryLabel,
  getDifficultyLabel,
  PROJECT_CATEGORIES,
  PROJECT_DIFFICULTIES,
} from "../explore-filters";
import type {
  ProjectCategory,
  ProjectDifficulty,
} from "../../types/project.types";
import type { PreviewGitHubRepositoryResponseDto } from "../../types/project-draft.types";

export interface SuggestedRepository {
  fullName: string;
  description: string | null;
  isPrivate: boolean;
}

interface ImportProjectStepperProps {
  onDraftCreated: (projectId: string) => void;
  /** Optional: the owner's connected GitHub repos, composed in at the route
   * level (this module never imports the `github`/`github-app` modules
   * directly). Purely a convenience shortcut for filling the reference field. */
  suggestedRepositories?: SuggestedRepository[];
  suggestedRepositoriesLoading?: boolean;
  suggestedRepositoriesError?: string | null;
}

/**
 * SK-112 owner draft flow: submit a repository reference, review the
 * normalized preview (source facts are never editable), adjust the
 * owner-controlled defaults, then explicitly save a private draft. Nothing
 * here publishes — publication is a separate explicit step on the owner
 * project management page.
 */
export function ImportProjectStepper({
  onDraftCreated,
  suggestedRepositories = [],
  suggestedRepositoriesLoading = false,
  suggestedRepositoriesError = null,
}: ImportProjectStepperProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState("");
  const [preview, setPreview] =
    useState<PreviewGitHubRepositoryResponseDto | null>(null);
  const [draftIdempotencyKey, setDraftIdempotencyKey] = useState<
    string | null
  >(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [difficulty, setDifficulty] = useState<ProjectDifficulty | null>(
    null,
  );

  const previewMutation = usePreviewGitHubRepositoryMutation();
  const createDraftMutation = useCreateProjectDraftMutation();

  function handlePreview(referenceValue: string) {
    const trimmed = referenceValue.trim();
    if (trimmed === "") return;
    setReference(trimmed);
    previewMutation.mutate(
      { repositoryReference: trimmed },
      {
        onSuccess: (result) => {
          setPreview(result);
          setTitle(result.ownerDefaults.title);
          setDescription(result.ownerDefaults.description ?? "");
          setTags(formatFieldList(result.ownerDefaults.tags));
          setTechnologies(formatFieldList(result.ownerDefaults.technologies));
          setCategory(null);
          setDifficulty(null);
          setDraftIdempotencyKey(createIdempotencyKey());
          setStep(1);
        },
      },
    );
  }

  function handleSaveDraft() {
    if (preview === null || draftIdempotencyKey === null) return;
    createDraftMutation.mutate(
      {
        idempotencyKey: draftIdempotencyKey,
        source: {
          provider: "github",
          repositoryReference: reference,
          previewFingerprint: preview.previewFingerprint,
        },
        project: {
          title,
          description: description.trim() === "" ? null : description,
          tags: parseFieldList(tags),
          technologies: parseFieldList(technologies),
          category,
          difficulty,
        },
      },
      {
        onSuccess: (project) => onDraftCreated(project.id),
        onError: (error) => {
          if (isPreviewStaleError(error)) {
            setPreview(null);
            setStep(0);
          }
        },
      },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("project.import.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("project.import.description")}
        </p>
      </div>

      <StepIndicator
        steps={[t("project.import.stepRepository"), t("project.import.stepReview")]}
        currentStep={step}
      />

      {step === 0 && (
        <Card>
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              handlePreview(reference);
            }}
          >
            <label className="flex items-center gap-2.5 rounded-input border border-border bg-input-bg px-4 py-2.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                dir="ltr"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder={t("project.import.referencePlaceholder")}
                className="w-full bg-transparent font-mono text-[13px] tracking-[0.65px] text-foreground outline-none placeholder:text-input-placeholder"
              />
            </label>
            <Button
              type="submit"
              className="mt-1"
              disabled={previewMutation.isPending || reference.trim() === ""}
            >
              {previewMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {t("project.import.previewRepository")}
            </Button>
          </form>

          {previewMutation.isError && (
            <p className="mt-3 text-sm leading-6 text-destructive">
              {getProjectApiErrorMessage(t, previewMutation.error)}
            </p>
          )}

          {suggestedRepositories.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                {t("project.import.chooseLinked")}
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {suggestedRepositories.map((repo) => (
                  <button
                    key={repo.fullName}
                    type="button"
                    disabled={previewMutation.isPending}
                    onClick={() => handlePreview(repo.fullName)}
                    className={cn(
                      "flex items-center gap-3 rounded-input border border-border bg-background p-3 text-start transition-colors",
                      "hover:border-primary/50",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        dir="ltr"
                        className="text-end font-mono text-[13px] font-bold tracking-[0.65px] text-foreground"
                      >
                        {repo.fullName}
                      </p>
                      {repo.description && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    {repo.isPrivate && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3.5" />
                        {t("project.source.private")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestedRepositoriesLoading && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t("project.import.loadingLinked")}
            </p>
          )}
          {suggestedRepositoriesError && (
            <p className="mt-4 text-xs text-muted-foreground">
              {suggestedRepositoriesError}
            </p>
          )}
        </Card>
      )}

      {step === 1 && preview !== null && (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {t("project.import.repositoryData")}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  preview.evidence.completeness === "complete"
                    ? "bg-evidence-teal/10 text-evidence-teal"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                )}
              >
                {preview.evidence.completeness === "complete"
                  ? t("project.import.completeData")
                  : t("project.import.partialData")}
              </span>
            </div>
            <p
              dir="ltr"
              className="mt-2 text-end font-mono text-sm tracking-[0.65px] text-foreground"
            >
              {preview.source.fullName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {preview.source.visibility === "private"
                ? t("project.source.private")
                : t("project.source.public")}{" "}
              · {getOwnerTypeLabel(t, preview.source.ownerType)}
              {preview.source.defaultBranch && (
                <>
                  {" "}
                  · {t("project.source.defaultBranch")}{" "}
                  <bdi dir="ltr">{preview.source.defaultBranch}</bdi>
                </>
              )}
            </p>

            {preview.evidence.unavailableAreas.length > 0 && (
              <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {t("project.import.unavailableWarning", {
                  areas: new Intl.ListFormat(i18n.language).format(
                    preview.evidence.unavailableAreas,
                  ),
                })}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-foreground">
              {t("project.import.reviewData")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("project.import.reviewDescription")}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <FieldLabel label={t("project.fields.title")}>
                <Input
                  dir="ltr"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </FieldLabel>

              <FieldLabel label={t("project.fields.description")}>
                <textarea
                  dir="rtl"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-sm text-foreground outline-none"
                />
              </FieldLabel>

              <FieldLabel label={t("project.fields.tags")} hint={t("project.fields.commaSeparated")}>
                <Input
                  dir="ltr"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="collaboration, education"
                />
              </FieldLabel>

              <FieldLabel label={t("project.fields.technologies")} hint={t("project.fields.commaSeparated")}>
                <Input
                  dir="ltr"
                  value={technologies}
                  onChange={(event) => setTechnologies(event.target.value)}
                  placeholder="TypeScript, NestJS"
                />
              </FieldLabel>

              <FieldLabel label={t("project.fields.category")} hint={t("project.fields.requiredBeforePublish")}>
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
              </FieldLabel>

              <FieldLabel label={t("project.fields.difficulty")} hint={t("project.fields.requiredBeforePublish")}>
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
              </FieldLabel>
            </div>

            {createDraftMutation.isError && (
              <p className="mt-4 text-sm leading-6 text-destructive">
                {getProjectApiErrorMessage(t, createDraftMutation.error)}
              </p>
            )}

            <div className="mt-5 flex gap-2.5 border-t border-border pt-4">
              <Button
                className="flex-1"
                disabled={createDraftMutation.isPending || title.trim() === ""}
                onClick={handleSaveDraft}
              >
                {createDraftMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {t("project.import.saveDraft")}
              </Button>
              <Button
                variant="outline"
                disabled={createDraftMutation.isPending}
                onClick={() => setStep(0)}
              >
                {t("project.import.back")}
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              {t("project.import.saveNote")}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {hint && (
          <span className="text-[11px] font-normal text-muted-foreground">
            — {hint}
          </span>
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
