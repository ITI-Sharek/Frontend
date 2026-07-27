import { ShieldCheck } from "lucide-react";

import { Checkbox } from "@/shared/components/ui/checkbox";

import { SKILL_ANALYSIS_CONSENT_VERSION } from "../constants/skill-analysis.constants";

export const SKILL_ANALYSIS_CONSENT_LABEL =
  "أوافق صراحةً على أن يقرأ Share-k محتوى المستودعات التي اخترتها لاستخراج مهارات مرشحة.";

interface SkillAnalysisConsentProps {
  /** Always starts unchecked; never pre-accepted or remembered across runs. */
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function SkillAnalysisConsent({
  accepted,
  onChange,
  disabled = false,
  id = "skill-analysis-consent",
}: SkillAnalysisConsentProps) {
  return (
    <div className="rounded-card border border-border bg-background p-4">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <Checkbox
          id={id}
          checked={accepted}
          disabled={disabled}
          onCheckedChange={(value) => onChange(value === true)}
          className="mt-0.5"
        />
        <span className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            الموافقة على تحليل المهارات
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            {SKILL_ANALYSIS_CONSENT_LABEL}
          </span>
          <span
            dir="ltr"
            className="text-start font-mono text-[11px] text-muted-foreground"
          >
            {SKILL_ANALYSIS_CONSENT_VERSION}
          </span>
        </span>
      </label>
    </div>
  );
}
