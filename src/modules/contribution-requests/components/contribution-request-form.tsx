import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Coins,
  FileText,
  Loader2,
  Plus,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormEvent, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";

import {
  toContributionRequestPayload,
  validateContributionRequestForm,
} from "../utils/contribution-request-form";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestFormErrors,
  ContributionRequestFormState,
} from "../types/contribution-request.types";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const POPULAR_TECH_PRESETS = [
  "TypeScript",
  "React",
  "Python",
  "Node.js",
  "Go",
  "Rust",
  "Next.js",
  "Docker",
  "PostgreSQL",
  "TailwindCSS",
];

export function ContributionRequestForm({
  initialState,
  isSubmitting,
  submitError,
  submitLabel,
  cancelHref,
  onCancel,
  onSubmit,
}: {
  initialState: ContributionRequestFormState;
  isSubmitting: boolean;
  submitError: string | null;
  submitLabel: string;
  cancelHref?: string;
  onCancel?: () => void;
  onSubmit: (payload: ContributionRequestDraftPayload) => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<ContributionRequestFormErrors>({});
  const [tagDraft, setTagDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pendingTag = tagDraft.trim();
    const submissionForm =
      pendingTag !== "" &&
      form.technologyTags.length < 20 &&
      !form.technologyTags.some(
        (existing) =>
          existing.toLocaleLowerCase() === pendingTag.toLocaleLowerCase(),
      )
        ? { ...form, technologyTags: [...form.technologyTags, pendingTag] }
        : form;
    if (submissionForm !== form) {
      setForm(submissionForm);
      setTagDraft("");
    }
    const nextErrors = validateContributionRequestForm(submissionForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true']")
          ?.focus();
      });
      return;
    }
    await onSubmit(toContributionRequestPayload(submissionForm));
  }

  function setField<TKey extends keyof ContributionRequestFormState>(
    field: TKey,
    value: ContributionRequestFormState[TKey],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function commitTag() {
    const tag = tagDraft.trim();
    setTagDraft("");
    if (
      tag === "" ||
      form.technologyTags.length >= 20 ||
      form.technologyTags.some(
        (existing) => existing.toLocaleLowerCase() === tag.toLocaleLowerCase(),
      )
    ) {
      return;
    }
    setField("technologyTags", [...form.technologyTags, tag]);
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTag();
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      className="space-y-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* ═════════ LEFT / PRIMARY COLUMN: Specs & Requirements (8 cols) ═════════ */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          {/* 1. Overview & Specifications Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-4.5" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {t("contributionRequests.create.draftDetails", "Task Details & Scope")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("contributionRequests.create.ownerProjectNotice", "Define clear scope, deliverable expectations, and context for contributors.")}
                </p>
              </div>
            </div>

            {/* Task Title */}
            <FormField
              error={errors.title}
              id="contribution-request-title"
              label={t("contributionRequests.form.title")}
            >
              <Input
                id="contribution-request-title"
                dir={i18n.language.startsWith("en") ? "ltr" : "rtl"}
                value={form.title}
                maxLength={255}
                placeholder={t("contributionRequests.form.titlePlaceholder")}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? "contribution-request-title-error" : undefined
                }
                onChange={(event) => setField("title", event.target.value)}
                className="h-11 text-sm font-semibold"
              />
            </FormField>

            {/* Task Description */}
            <FormField
              error={errors.description}
              id="contribution-request-description"
              label={t("contributionRequests.form.description")}
            >
              <Textarea
                id="contribution-request-description"
                dir={i18n.language.startsWith("en") ? "ltr" : "rtl"}
                rows={7}
                value={form.description}
                maxLength={5000}
                placeholder={t("contributionRequests.form.descriptionPlaceholder")}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? "contribution-request-description-error"
                    : undefined
                }
                onChange={(event) => setField("description", event.target.value)}
                className="text-sm leading-relaxed"
              />
            </FormField>
          </div>

          {/* 2. Side-by-Side Requirements Grid (Required vs Preferred across width!) */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    {t("contributionRequests.form.requiredRequirements")} & {t("contributionRequests.form.preferredRequirements")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t("contributionRequests.form.requiredDescription")}
                  </p>
                </div>
              </div>
            </div>

            {/* 2-Column Side-by-Side Width Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RequirementEditor
                id="required-requirements"
                title={t("contributionRequests.form.requiredRequirements")}
                description={t("contributionRequests.form.requiredDescription")}
                badge={t("contributionRequests.form.mustHaveBadge")}
                badgeColor="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                values={form.requiredRequirements}
                minimum={1}
                error={errors.requiredRequirements}
                onChange={(values) => setField("requiredRequirements", values)}
              />

              <RequirementEditor
                id="preferred-requirements"
                title={t("contributionRequests.form.preferredRequirements")}
                description={t("contributionRequests.form.preferredDescription")}
                badge={t("contributionRequests.form.optionalBadge")}
                badgeColor="bg-primary/10 text-primary border-primary/30"
                values={form.preferredRequirements}
                minimum={0}
                error={errors.preferredRequirements}
                onChange={(values) => setField("preferredRequirements", values)}
              />
            </div>
          </div>
        </div>

        {/* ═════════ RIGHT / SIDEBAR COLUMN: Parameters, Timeline & Reward (4 cols) ═════════ */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          {/* 3. Task Parameters & Difficulty */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
              <SlidersHorizontal className="size-4 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">
                {t("contributionRequests.form.difficulty")} & {t("contributionRequests.form.tags")}
              </h3>
            </div>

            {/* Difficulty Level */}
            <FormField
              error={errors.difficulty}
              id="difficulty"
              label={t("contributionRequests.form.difficulty")}
            >
              <NativeSelect
                id="difficulty"
                value={form.difficulty}
                aria-invalid={Boolean(errors.difficulty)}
                className="h-10 text-xs font-semibold"
                onChange={(event) =>
                  setField(
                    "difficulty",
                    event.target.value as ContributionRequestFormState["difficulty"],
                  )
                }
              >
                <NativeSelectOption value="">
                  {t("contributionRequests.form.none")}
                </NativeSelectOption>
                {DIFFICULTIES.map((difficulty) => (
                  <NativeSelectOption key={difficulty} value={difficulty}>
                    {t(`contributionRequests.form.difficulties.${difficulty}`)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormField>

            {/* Technology Tags & Presets */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="technology-tag-input" className="text-xs font-bold text-foreground">
                {t("contributionRequests.form.tags")}
              </Label>
              <p className="text-xs leading-5 text-muted-foreground">
                {t("contributionRequests.form.tagsHelp")}
              </p>

              {/* Tag Input Box */}
              <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-border bg-input-bg p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
                {form.technologyTags.map((tag) => (
                  <span
                    key={tag.toLocaleLowerCase()}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary"
                  >
                    <span dir="ltr">{tag}</span>
                    <button
                      type="button"
                      aria-label={t("contributionRequests.form.removeTag", { tag })}
                      onClick={() =>
                        setField(
                          "technologyTags",
                          form.technologyTags.filter((existing) => existing !== tag),
                        )
                      }
                      className="text-primary hover:text-destructive transition-colors"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                <input
                  id="technology-tag-input"
                  dir="ltr"
                  value={tagDraft}
                  maxLength={50}
                  disabled={form.technologyTags.length >= 20}
                  aria-invalid={Boolean(errors.technologyTags)}
                  aria-describedby={
                    errors.technologyTags ? "technology-tag-input-error" : undefined
                  }
                  placeholder={
                    form.technologyTags.length === 0 ? t("contributionRequests.form.addTagPlaceholder") : undefined
                  }
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={commitTag}
                  className="min-w-24 flex-1 bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Quick Tech Presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground me-1">
                  <Sparkles className="size-2.5 text-evidence-teal" />
                  <span>{t("tasks.quickPresets", "Popular")}:</span>
                </span>
                {POPULAR_TECH_PRESETS.map((preset) => {
                  const isSelected = form.technologyTags.some(
                    (tItem) => tItem.toLowerCase() === preset.toLowerCase(),
                  );
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setField(
                            "technologyTags",
                            form.technologyTags.filter((tItem) => tItem.toLowerCase() !== preset.toLowerCase()),
                          );
                        } else if (form.technologyTags.length < 20) {
                          setField("technologyTags", [...form.technologyTags, preset]);
                        }
                      }}
                      className={cn(
                        "rounded-md border px-2 py-0.5 font-mono text-[10.5px] transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "border-border/70 bg-surface-fog text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                    </button>
                  );
                })}
              </div>

              <FieldError
                id="technology-tag-input-error"
                message={errors.technologyTags}
              />
            </div>
          </div>

          {/* 4. Timeline & Schedule Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
              <Calendar className="size-4 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">
                {t("contributionRequests.form.closeTime")} & {t("contributionRequests.form.targetDate")}
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <FormField
                error={errors.applicationsCloseTime}
                id="applications-close-time"
                label={t("contributionRequests.form.closeTime")}
              >
                <Input
                  id="applications-close-time"
                  type="datetime-local"
                  dir="ltr"
                  value={form.applicationsCloseTime}
                  aria-invalid={Boolean(errors.applicationsCloseTime)}
                  aria-describedby={
                    errors.applicationsCloseTime
                      ? "applications-close-time-error"
                      : undefined
                  }
                  onChange={(event) =>
                    setField("applicationsCloseTime", event.target.value)
                  }
                  className="h-10 text-xs font-mono"
                />
              </FormField>

              <FormField
                error={errors.targetCompletionDate}
                id="target-completion-date"
                label={t("contributionRequests.form.targetDate")}
              >
                <Input
                  id="target-completion-date"
                  type="date"
                  dir="ltr"
                  value={form.targetCompletionDate}
                  aria-invalid={Boolean(errors.targetCompletionDate)}
                  aria-describedby={
                    errors.targetCompletionDate
                      ? "target-completion-date-error"
                      : undefined
                  }
                  onChange={(event) =>
                    setField("targetCompletionDate", event.target.value)
                  }
                  className="h-10 text-xs font-mono"
                />
              </FormField>
            </div>
          </div>

          {/* 5. Compensation & Bounty Card */}
          <fieldset className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5 border-b border-border pb-3.5">
              <Coins className="size-4 text-primary" />
              <legend className="text-sm font-extrabold text-foreground">
                {t("contributionRequests.form.reward")}
              </legend>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              {t("contributionRequests.form.rewardHelp")}
            </p>
            <div className="grid grid-cols-[1fr_5.5rem] gap-2.5">
              <FormField error={errors.reward} id="reward" label={t("contributionRequests.form.amount")}>
                <Input
                  id="reward"
                  type="text"
                  inputMode="decimal"
                  dir="ltr"
                  placeholder="0.00"
                  value={form.reward}
                  aria-invalid={Boolean(errors.reward)}
                  onChange={(event) => setField("reward", event.target.value)}
                  className="h-10 font-mono text-xs font-bold"
                />
              </FormField>
              <FormField
                error={errors.rewardCurrency}
                id="reward-currency"
                label={t("contributionRequests.form.currency")}
              >
                <Input
                  id="reward-currency"
                  dir="ltr"
                  value={form.rewardCurrency}
                  maxLength={3}
                  placeholder="USD"
                  aria-invalid={Boolean(errors.rewardCurrency)}
                  onChange={(event) =>
                    setField("rewardCurrency", event.target.value.toUpperCase())
                  }
                  className="h-10 font-mono text-xs font-bold text-center"
                />
              </FormField>
            </div>
          </fieldset>

          {/* 6. Sticky Action & Submission Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-3">
            {submitError && (
              <p
                role="alert"
                aria-live="assertive"
                className="text-xs font-bold text-destructive"
              >
                {submitError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full gap-2 rounded-xl font-bold text-sm h-12 shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                <span>{submitLabel}</span>
              </Button>
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  disabled={isSubmitting}
                  onClick={onCancel}
                  className="w-full rounded-xl font-bold"
                >
                  {t("common.cancel")}
                </Button>
              ) : cancelHref ? (
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  size="default"
                  disabled={isSubmitting}
                  className="w-full rounded-xl font-bold"
                >
                  <a href={cancelHref}>{t("common.cancel")}</a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function RequirementEditor({
  id,
  title,
  badge,
  badgeColor,
  description,
  values,
  minimum,
  error,
  onChange,
}: {
  id: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  values: string[];
  minimum: number;
  error?: string;
  onChange: (values: string[]) => void;
}) {
  const { t } = useTranslation();
  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target] ?? "", next[index] ?? ""];
    onChange(next);
  }

  return (
    <fieldset
      className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-fog/40 p-4"
      aria-describedby={`${id}-hint ${id}-error`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
          <legend className="text-sm font-extrabold text-foreground">
            {title}
          </legend>
          {badge && (
            <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-bold", badgeColor)}>
              {badge}
            </span>
          )}
        </div>
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
        <div className="mt-3 flex flex-col gap-2.5">
          {values.map((value, index) => (
            <div key={`${id}-${index}`} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <Input
                value={value}
                maxLength={500}
                aria-label={`${title} ${index + 1}`}
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                className="h-9 text-xs"
              />
              <div className="flex shrink-0 gap-1">
                <IconButton
                  label={t("contributionRequests.form.moveUp")}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-3.5" />
                </IconButton>
                <IconButton
                  label={t("contributionRequests.form.moveDown")}
                  disabled={index === values.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-3.5" />
                </IconButton>
                <IconButton
                  label={t("contributionRequests.form.removeRequirement")}
                  disabled={values.length <= minimum}
                  onClick={() =>
                    onChange(values.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        <FieldError id={`${id}-error`} message={error} />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3 gap-1.5 rounded-lg text-xs font-bold self-start"
        disabled={values.length >= 20}
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-3.5" aria-hidden="true" />
        {t("contributionRequests.form.addRequirement")}
      </Button>
    </fieldset>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-bold text-foreground">{label}</Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert" className="text-xs leading-5 text-destructive font-medium">
      {message}
    </p>
  ) : null;
}
