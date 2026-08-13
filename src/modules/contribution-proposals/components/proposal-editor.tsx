import { Loader2 } from "lucide-react";
import type { TFunction } from "i18next";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
    const nextErrors = validateProposalFields(t, normalized);
    if (requiresDisclosure && !acknowledged) {
      nextErrors.disclosure = t("proposalEditor.disclosureRequired");
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
          setUnexpectedError(t("proposalEditor.unexpectedError"));
        });
      }}
      className="space-y-5"
    >
      <ProposalTextField
        id={`${formId}-title`}
        label={t("proposalEditor.title")}
        value={fields.title}
        error={errors.title}
        minLength={5}
        maxLength={255}
        lengthHelp={t("proposalEditor.lengthHelp", { min: 5, max: 255 })}
        onChange={(value) => update("title", value)}
      />
      <ProposalTextField
        id={`${formId}-problem`}
        label={t("proposalEditor.problemOrOpportunity")}
        value={fields.problemOrOpportunity}
        error={errors.problemOrOpportunity}
        minLength={20}
        maxLength={5000}
        multiline
        lengthHelp={t("proposalEditor.lengthHelp", { min: 20, max: 5000 })}
        onChange={(value) => update("problemOrOpportunity", value)}
      />
      <ProposalTextField
        id={`${formId}-outcome`}
        label={t("proposalEditor.proposedOutcome")}
        value={fields.proposedOutcome}
        error={errors.proposedOutcome}
        minLength={20}
        maxLength={5000}
        multiline
        lengthHelp={t("proposalEditor.lengthHelp", { min: 20, max: 5000 })}
        onChange={(value) => update("proposedOutcome", value)}
      />
      <ProposalTextField
        id={`${formId}-benefit`}
        label={t("proposalEditor.projectBenefit")}
        value={fields.projectBenefit}
        error={errors.projectBenefit}
        minLength={20}
        maxLength={3000}
        multiline
        lengthHelp={t("proposalEditor.lengthHelp", { min: 20, max: 3000 })}
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
              {t("proposalEditor.disclosureText")}
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
  lengthHelp,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  minLength: number;
  maxLength: number;
  multiline?: boolean;
  onChange: (value: string) => void;
  lengthHelp: string;
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
        <span>{lengthHelp}</span>
        <span>{value.length}/{maxLength}</span>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function validateProposalFields(
  t: TFunction,
  fields: ContributionProposalFields,
): ProposalFieldErrors {
  const errors: ProposalFieldErrors = {};
  validateLength(t, errors, "title", fields.title, 5, 255, "proposalEditor.title");
  validateLength(
    t,
    errors,
    "problemOrOpportunity",
    fields.problemOrOpportunity,
    20,
    5000,
    "proposalEditor.problemOrOpportunity",
  );
  validateLength(
    t,
    errors,
    "proposedOutcome",
    fields.proposedOutcome,
    20,
    5000,
    "proposalEditor.proposedOutcome",
  );
  validateLength(
    t,
    errors,
    "projectBenefit",
    fields.projectBenefit,
    20,
    3000,
    "proposalEditor.projectBenefit",
  );
  return errors;
}

function validateLength(
  t: TFunction,
  errors: ProposalFieldErrors,
  field: ProposalField,
  value: string,
  min: number,
  max: number,
  labelKey: string,
) {
  if (value.length < min || value.length > max) {
    errors[field] = t("proposalEditor.lengthError", {
      label: t(labelKey),
      min,
      max,
    });
  }
}
