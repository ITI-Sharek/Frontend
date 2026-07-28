import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import {
  toContributionRequestPayload,
  validateContributionRequestForm,
} from "../utils/contribution-request-form";
import type {
  ContributionRequestDraftPayload,
  ContributionRequestFormErrors,
  ContributionRequestFormState,
} from "../types/contribution-request.types";

const DIFFICULTIES = [
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
] as const;

export function ContributionRequestForm({
  initialState,
  isSubmitting,
  submitError,
  submitLabel,
  cancelHref,
  onSubmit,
}: {
  initialState: ContributionRequestFormState;
  isSubmitting: boolean;
  submitError: string | null;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (payload: ContributionRequestDraftPayload) => Promise<void>;
}) {
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
        (existing) => existing.toLocaleLowerCase() === pendingTag.toLocaleLowerCase(),
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
      className="flex flex-col gap-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <FormField error={errors.title} id="contribution-request-title" label="العنوان">
        <Input
          id="contribution-request-title"
          dir="rtl"
          value={form.title}
          maxLength={255}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "contribution-request-title-error" : undefined}
          onChange={(event) => setField("title", event.target.value)}
        />
      </FormField>

      <FormField
        error={errors.description}
        id="contribution-request-description"
        label="الوصف"
      >
        <textarea
          id="contribution-request-description"
          dir="rtl"
          rows={6}
          value={form.description}
          maxLength={5000}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "contribution-request-description-error" : undefined
          }
          onChange={(event) => setField("description", event.target.value)}
          className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-sm leading-7 text-foreground outline-none transition-colors focus:border-primary"
        />
      </FormField>

      <RequirementEditor
        id="required-requirements"
        title="المتطلبات المطلوبة"
        description="قدرات أو نتائج أساسية لإنجاز طلب المساهمة. الترتيب محفوظ."
        values={form.requiredRequirements}
        minimum={1}
        error={errors.requiredRequirements}
        onChange={(values) => setField("requiredRequirements", values)}
      />

      <RequirementEditor
        id="preferred-requirements"
        title="المتطلبات المفضلة"
        description="عناصر مفيدة لكنها ليست شرطًا أساسيًا."
        values={form.preferredRequirements}
        minimum={0}
        error={errors.preferredRequirements}
        onChange={(values) => setField("preferredRequirements", values)}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="technology-tag-input">وسوم التقنيات (اختياري)</Label>
        <p className="text-xs leading-5 text-muted-foreground">
          اكتب التقنية واضغط Enter. الوسوم وصفية ولا تحل محل المتطلبات.
        </p>
        <div
          className="flex min-h-[50px] flex-wrap items-center gap-2 rounded-input border border-border bg-input-bg px-3 py-2 focus-within:border-primary"
        >
          {form.technologyTags.map((tag) => (
            <span
              key={tag.toLocaleLowerCase()}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
            >
              <span dir="ltr">{tag}</span>
              <button
                type="button"
                aria-label={`إزالة ${tag}`}
                onClick={() =>
                  setField(
                    "technologyTags",
                    form.technologyTags.filter((existing) => existing !== tag),
                  )
                }
              >
                <X className="size-3.5" aria-hidden="true" />
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
            aria-describedby={errors.technologyTags ? "technology-tag-input-error" : undefined}
            placeholder={form.technologyTags.length === 0 ? "NestJS" : undefined}
            onChange={(event) => setTagDraft(event.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={commitTag}
            className="min-w-28 flex-1 bg-transparent text-left text-sm text-foreground outline-none"
          />
        </div>
        <FieldError id="technology-tag-input-error" message={errors.technologyTags} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          error={errors.applicationsCloseTime}
          id="applications-close-time"
          label="وقت إغلاق التقديم"
        >
          <Input
            id="applications-close-time"
            type="datetime-local"
            dir="ltr"
            value={form.applicationsCloseTime}
            aria-invalid={Boolean(errors.applicationsCloseTime)}
            aria-describedby={
              errors.applicationsCloseTime ? "applications-close-time-error" : undefined
            }
            onChange={(event) => setField("applicationsCloseTime", event.target.value)}
          />
        </FormField>

        <FormField
          error={errors.targetCompletionDate}
          id="target-completion-date"
          label="تاريخ الإنجاز المستهدف (اختياري)"
        >
          <Input
            id="target-completion-date"
            type="date"
            dir="ltr"
            value={form.targetCompletionDate}
            aria-invalid={Boolean(errors.targetCompletionDate)}
            aria-describedby={
              errors.targetCompletionDate ? "target-completion-date-error" : undefined
            }
            onChange={(event) => setField("targetCompletionDate", event.target.value)}
          />
        </FormField>
      </div>

      <FormField error={errors.difficulty} id="difficulty" label="مستوى الصعوبة (اختياري)">
        <select
          id="difficulty"
          value={form.difficulty}
          aria-invalid={Boolean(errors.difficulty)}
          onChange={(event) =>
            setField(
              "difficulty",
              event.target.value as ContributionRequestFormState["difficulty"],
            )
          }
          className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">بدون تحديد</option>
          {DIFFICULTIES.map((difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </option>
          ))}
        </select>
      </FormField>

      <fieldset className="rounded-card border border-border p-4">
        <legend className="px-2 text-sm font-semibold text-foreground">المكافأة (اختياري)</legend>
        <p className="mb-3 text-xs leading-5 text-muted-foreground">
          أدخل القيمة والعملة معًا. لا تترك أحد الحقلين منفردًا.
        </p>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <FormField error={errors.reward} id="reward" label="القيمة">
            <Input
              id="reward"
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={form.reward}
              aria-invalid={Boolean(errors.reward)}
              onChange={(event) => setField("reward", event.target.value)}
            />
          </FormField>
          <FormField error={errors.rewardCurrency} id="reward-currency" label="العملة">
            <Input
              id="reward-currency"
              dir="ltr"
              value={form.rewardCurrency}
              maxLength={3}
              placeholder="USD"
              aria-invalid={Boolean(errors.rewardCurrency)}
              onChange={(event) => setField("rewardCurrency", event.target.value.toUpperCase())}
            />
          </FormField>
        </div>
      </fieldset>

      {submitError && (
        <p role="alert" aria-live="assertive" className="text-sm leading-6 text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {submitLabel}
        </Button>
        <Button asChild type="button" variant="outline" disabled={isSubmitting}>
          <a href={cancelHref}>إلغاء</a>
        </Button>
      </div>
    </form>
  );
}

function RequirementEditor({
  id,
  title,
  description,
  values,
  minimum,
  error,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  values: string[];
  minimum: number;
  error?: string;
  onChange: (values: string[]) => void;
}) {
  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target] ?? "", next[index] ?? ""];
    onChange(next);
  }

  return (
    <fieldset className="rounded-card border border-border p-4" aria-describedby={`${id}-hint ${id}-error`}>
      <legend className="px-2 text-base font-bold text-foreground">{title}</legend>
      <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {values.map((value, index) => (
          <div key={`${id}-${index}`} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center font-mono text-xs text-muted-foreground">
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
            />
            <div className="flex shrink-0 gap-1">
              <IconButton
                label="تحريك لأعلى"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" />
              </IconButton>
              <IconButton
                label="تحريك لأسفل"
                disabled={index === values.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" />
              </IconButton>
              <IconButton
                label="إزالة المتطلب"
                disabled={values.length <= minimum}
                onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3"
        disabled={values.length >= 20}
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="size-4" aria-hidden="true" />
        إضافة متطلب
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
      className="flex size-9 items-center justify-center rounded-input border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-35"
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
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert" className="text-xs leading-5 text-destructive">
      {message}
    </p>
  ) : null;
}
