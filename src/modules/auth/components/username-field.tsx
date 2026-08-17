import { AtSign, Check, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";

import type {
  UsernameAvailabilityReason,
} from "../types/auth.types";

interface UsernameFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  formatValid: boolean;
  isChecking: boolean;
  checkFailed: boolean;
  available: boolean | null;
  reason: UsernameAvailabilityReason | null;
  suggestion: string | null;
  onUseSuggestion: (suggestion: string) => void;
}

export function UsernameField({
  id,
  value,
  onChange,
  formatValid,
  isChecking,
  checkFailed,
  available,
  reason,
  suggestion,
  onUseSuggestion,
}: UsernameFieldProps) {
  const { t } = useTranslation();
  const showFormatError = value.trim().length > 0 && !formatValid;
  const showStatus = value.trim().length > 0 && formatValid;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={id} className="w-full text-start">
        {t("auth.username.label")}
      </Label>
      <div className="relative w-full">
        <Input
          id={id}
          dir="ltr"
          className="pe-10 ps-10 text-left"
          placeholder="sara-dev"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-status`}
        />
        <AtSign className="absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
        {showStatus && (
          <span className="absolute top-1/2 end-3 -translate-y-1/2">
            {isChecking ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : checkFailed ? null : available === true ? (
              <Check className="size-4 text-evidence-teal" />
            ) : available === false ? (
              <X className="size-4 text-destructive" />
            ) : null}
          </span>
        )}
      </div>

      <p
        id={`${id}-status`}
        aria-live="polite"
        className={cn(
          "min-h-[1.25rem] w-full text-start text-xs",
          available === false && !isChecking
            ? "text-destructive"
            : available === true && !isChecking
              ? "text-evidence-teal"
              : "text-muted-foreground",
        )}
      >
        {showFormatError && t("auth.username.invalidFormat")}
        {!showFormatError && showStatus && isChecking && t("auth.username.checking")}
        {!showFormatError && showStatus && !isChecking && checkFailed &&
          t("auth.username.checkFailed")}
        {!showFormatError && showStatus && !isChecking && !checkFailed &&
          available === true &&
          t("auth.username.available")}
        {!showFormatError && showStatus && !isChecking && !checkFailed &&
          available === false &&
          reason &&
          t(`auth.username.${reason}`)}
      </p>

      {available === false && reason === "taken" && suggestion && (
        <button
          type="button"
          onClick={() => onUseSuggestion(suggestion)}
          className="w-fit self-end rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {t("auth.username.try")} <span dir="ltr">{suggestion}</span>
        </button>
      )}
    </div>
  );
}
