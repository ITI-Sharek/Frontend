import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/shared/components/ui/checkbox";

import { SKILL_ANALYSIS_CONSENT_VERSION } from "../constants/skill-analysis.constants";

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
  const { t } = useTranslation();
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
            {t("skillProfile.consent.title")}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            {t("skillProfile.consent.agreementLabel")}
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
