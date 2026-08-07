import { CloudUpload, Loader2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { getMaterialErrorMessage } from "../constants/material-copy";
import type {
  MaterialUploadConstraintsDto,
  MaterialVisibility,
} from "../types/material.types";
import { createMaterialIdempotencyKey } from "../utils/material-idempotency";
import {
  formatBytes,
  formatMimeType,
  getVisibilityCopy,
} from "../utils/material-state";

const VISIBILITY_ORDER: MaterialVisibility[] = [
  "PUBLIC",
  "RESTRICTED_PROJECT",
  "ASSIGNMENT",
];

export interface MaterialUploadFormProps {
  constraints: MaterialUploadConstraintsDto | undefined;
  isConstraintsLoading: boolean;
  /**
   * `assignment` visibility only opens a Material to anyone on a Contribution
   * Request, so the option is withheld on a Project rather than offered and
   * then refused by the server.
   */
  allowAssignmentVisibility: boolean;
  isSubmitting: boolean;
  onUpload: (input: {
    file: File;
    title: string;
    visibility: MaterialVisibility;
    idempotencyKey: string;
  }) => Promise<void>;
}

export function MaterialUploadForm({
  constraints,
  isConstraintsLoading,
  allowAssignmentVisibility,
  isSubmitting,
  onUpload,
}: MaterialUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<MaterialVisibility>("PUBLIC");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const fileId = useId();
  const errorId = useId();
  const constraintsId = useId();

  const visibilities = VISIBILITY_ORDER.filter(
    (option) => option !== "ASSIGNMENT" || allowAssignmentVisibility,
  );

  function reset() {
    setFile(null);
    setTitle("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /**
   * Client-side checks mirror the server's and never replace them. They exist
   * to spare a 25MB upload that was always going to be refused; the server
   * remains the only authority on what is accepted.
   */
  function validate(candidate: File): string | null {
    if (!constraints) return null;
    if (candidate.size > constraints.maxBytes) {
      return `حجم الملف يتجاوز الحد المسموح به (${formatBytes(constraints.maxBytes)}).`;
    }
    if (
      candidate.type !== "" &&
      !constraints.allowedMimeTypes.includes(candidate.type)
    ) {
      return "صيغة الملف غير مدعومة. اختر ملفًا بإحدى الصيغ المذكورة.";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("اختر ملفًا قبل الرفع.");
      return;
    }
    if (title.trim().length < 3) {
      setError("اكتب عنوانًا لا يقل عن ٣ أحرف.");
      return;
    }
    const localError = validate(file);
    if (localError) {
      setError(localError);
      return;
    }

    setError(null);
    try {
      await onUpload({
        file,
        title: title.trim(),
        visibility,
        idempotencyKey: createMaterialIdempotencyKey(),
      });
      reset();
    } catch (uploadError) {
      setError(getMaterialErrorMessage(uploadError));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-border/60 p-4 sm:p-5"
      aria-labelledby={`${fileId}-heading`}
    >
      <div>
        <h3 id={`${fileId}-heading`} className="text-sm font-semibold">
          رفع مادة جديدة
        </h3>
        <p id={constraintsId} className="mt-1 text-xs text-muted-foreground">
          {isConstraintsLoading || !constraints
            ? "جارٍ تحميل الصيغ والحدود المسموح بها…"
            : `الصيغ المدعومة: ${constraints.allowedMimeTypes
                .map(formatMimeType)
                .join("، ")} — بحد أقصى ${formatBytes(constraints.maxBytes)} للملف.`}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fileId}>الملف</Label>
        <Input
          id={fileId}
          ref={fileInputRef}
          type="file"
          accept={constraints?.allowedMimeTypes.join(",")}
          aria-describedby={constraintsId}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            setError(selected ? validate(selected) : null);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={titleId}>عنوان المادة</Label>
        <Input
          id={titleId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          placeholder="مثال: كراسة الشروط"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">مستوى الظهور</legend>
        {visibilities.map((option) => {
          const copy = getVisibilityCopy(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer gap-3 rounded-lg border border-border/60 p-3 text-start has-[:checked]:border-brand-indigo"
            >
              <input
                type="radio"
                name="material-visibility"
                value={option}
                checked={visibility === option}
                onChange={() => setVisibility(option)}
                className="mt-1 size-4 shrink-0"
              />
              <span>
                <span className="block text-sm font-medium">{copy.label}</span>
                {/* Each class is explained in full: "restricted" means nothing
                    on its own, and an owner picking it should know it ends
                    with the Assignment. */}
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {copy.description}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {error !== null && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        aria-describedby={error === null ? undefined : errorId}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <CloudUpload className="size-4" aria-hidden />
        )}
        {isSubmitting ? "جارٍ الرفع…" : "رفع المادة"}
      </Button>
    </form>
  );
}
