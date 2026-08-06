import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type { ContributionProposalFields } from "../types/contribution-proposal.types";
import { toProposalFields } from "../utils/proposal-fields";

type ProposalField = keyof ContributionProposalFields;
type ProposalFieldErrors = Partial<Record<ProposalField | "disclosure", string>>;

export function ProposalEditor({
  initialValue,
  requiresDisclosure,
  isSubmitting,
  submitLabel,
  error,
  onSubmit,
}: {
  initialValue?: ContributionProposalFields;
  requiresDisclosure: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  error: string | null;
  onSubmit: (fields: ContributionProposalFields) => Promise<void>;
}) {
  const [fields, setFields] = useState(() => toProposalFields(initialValue));
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<ProposalFieldErrors>({});
  const [unexpectedError, setUnexpectedError] = useState<string | null>(null);
  const formId = useId();

  function update(field: ProposalField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = toProposalFields(fields);
    const nextErrors = validateProposalFields(normalized);
    if (requiresDisclosure && !acknowledged) {
      nextErrors.disclosure = "يلزم تأكيد الإفصاح قبل إرسال المقترح.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(normalized);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        setUnexpectedError(null);
        void submit(event).catch(() => {
          setUnexpectedError(
            "تعذر إرسال النموذج الآن. احتفظنا بمدخلاتك؛ حاول مرة أخرى.",
          );
        });
      }}
      className="space-y-5"
    >
      <ProposalTextField
        id={`${formId}-title`}
        label="عنوان المقترح"
        value={fields.title}
        error={errors.title}
        minLength={5}
        maxLength={255}
        onChange={(value) => update("title", value)}
      />
      <ProposalTextField
        id={`${formId}-problem`}
        label="المشكلة أو الفرصة"
        value={fields.problemOrOpportunity}
        error={errors.problemOrOpportunity}
        minLength={20}
        maxLength={5000}
        multiline
        onChange={(value) => update("problemOrOpportunity", value)}
      />
      <ProposalTextField
        id={`${formId}-outcome`}
        label="النتيجة المقترحة"
        value={fields.proposedOutcome}
        error={errors.proposedOutcome}
        minLength={20}
        maxLength={5000}
        multiline
        onChange={(value) => update("proposedOutcome", value)}
      />
      <ProposalTextField
        id={`${formId}-benefit`}
        label="فائدة المقترح للمشروع"
        value={fields.projectBenefit}
        error={errors.projectBenefit}
        minLength={20}
        maxLength={3000}
        multiline
        onChange={(value) => update("projectBenefit", value)}
      />

      {requiresDisclosure && (
        <div className="rounded-card border border-primary/25 bg-primary/5 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-foreground">
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={isSubmitting}
              aria-invalid={errors.disclosure !== undefined}
              aria-describedby={`${formId}-disclosure-copy${errors.disclosure ? ` ${formId}-disclosure-error` : ""}`}
              onChange={(event) => {
                setAcknowledged(event.target.checked);
                if (errors.disclosure) {
                  setErrors((current) => ({ ...current, disclosure: undefined }));
                }
              }}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span id={`${formId}-disclosure-copy`}>
              أفهم أن قبول المقترح ينشئ مسودة يملك صاحب المشروع تحريرها ونشرها،
              ويحفظ لي الإسناد المعنوي فقط. لا يمنحني القبول إسناد العمل أو
              أولوية الاختيار، وقد ينفذ العمل مساهم آخر.
            </span>
          </label>
          {errors.disclosure && (
            <p id={`${formId}-disclosure-error`} role="alert" className="mt-2 text-sm text-destructive">
              {errors.disclosure}
            </p>
          )}
        </div>
      )}

      {(error ?? unexpectedError) && (
        <p role="alert" aria-live="assertive" className="text-sm leading-6 text-destructive">
          {error ?? unexpectedError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {submitLabel}
      </Button>
    </form>
  );
}

function ProposalTextField({
  id,
  label,
  value,
  error,
  minLength,
  maxLength,
  multiline = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  minLength: number;
  maxLength: number;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const describedBy = error ? `${id}-help ${id}-error` : `${id}-help`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={5}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1.5 w-full rounded-input border border-border bg-input-bg px-4 py-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
      ) : (
        <Input
          id={id}
          value={value}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <div id={`${id}-help`} className="mt-1 flex justify-between gap-3 text-xs text-muted-foreground">
        <span>من {minLength} إلى {maxLength} حرفًا.</span>
        <span>{value.length}/{maxLength}</span>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function validateProposalFields(
  fields: ContributionProposalFields,
): ProposalFieldErrors {
  const errors: ProposalFieldErrors = {};
  validateLength(errors, "title", fields.title, 5, 255, "العنوان");
  validateLength(
    errors,
    "problemOrOpportunity",
    fields.problemOrOpportunity,
    20,
    5000,
    "المشكلة أو الفرصة",
  );
  validateLength(
    errors,
    "proposedOutcome",
    fields.proposedOutcome,
    20,
    5000,
    "النتيجة المقترحة",
  );
  validateLength(
    errors,
    "projectBenefit",
    fields.projectBenefit,
    20,
    3000,
    "فائدة المشروع",
  );
  return errors;
}

function validateLength(
  errors: ProposalFieldErrors,
  field: ProposalField,
  value: string,
  min: number,
  max: number,
  label: string,
) {
  if (value.length < min || value.length > max) {
    errors[field] = `${label} يجب أن يكون بين ${min} و${max} حرفًا.`;
  }
}
