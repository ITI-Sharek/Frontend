import { Building2, Github, Globe } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { TagInput } from "@/shared/components/forms/tag-input";
import { ChipSelect } from "@/shared/components/forms/chip-select";
import type { ChipOption } from "@/shared/components/forms/chip-select";

import { getTeamSizeOptions } from "../../constants/signup.constants";
import type { SignupFormData } from "../../types/signup.types";
import { AuthTextField } from "../auth-text-field";

interface DetailsStepProps {
  data: SignupFormData;
  onFieldChange: <TKey extends keyof SignupFormData>(
    field: TKey,
    value: SignupFormData[TKey],
  ) => void;
  experienceLevelOptions: ChipOption[];
  contributorFieldOptions: ChipOption[];
  isExperienceLevelsLoading: boolean;
}

export function DetailsStep({
  data,
  onFieldChange,
  experienceLevelOptions,
  contributorFieldOptions,
  isExperienceLevelsLoading,
}: DetailsStepProps) {
  const { t } = useTranslation();
  const termsId = useId();

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex flex-col gap-0.5 text-right">
        <h2 className="text-sm font-bold text-foreground">
          {t("register.details.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("register.details.subtitle")}
        </p>
      </div>

      {data.role === "contributor" && (
        <>
          <TagInput
            id="contributorSkills"
            label={t("register.details.skills")}
            dir="rtl"
            placeholder={t("register.details.skillsPlaceholder")}
            value={data.contributorSkills}
            onChange={(tags) => onFieldChange("contributorSkills", tags)}
          />
          <ChipSelect
            label={t("register.details.experience")}
            options={experienceLevelOptions}
            value={data.contributorExperience}
            onChange={(v) => onFieldChange("contributorExperience", v as string)}
          />
          {isExperienceLevelsLoading ? (
            <p className="text-right text-[11px] text-muted-foreground">
              {t("register.details.loadingExperience")}
            </p>
          ) : experienceLevelOptions.length === 0 ? (
            <p className="text-right text-[11px] text-muted-foreground">
              {t("register.details.noExperienceLevels")}
            </p>
          ) : null}
          <ChipSelect
            label={t("register.details.interests")}
            options={contributorFieldOptions}
            value={data.contributorInterests}
            onChange={(v) =>
              onFieldChange("contributorInterests", v as string[])
            }
            multiple
          />
          <AuthTextField
            id="contributorGithubUrl"
            label={t("register.details.githubUrl")}
            icon={Github}
            placeholder="https://github.com/username"
            value={data.contributorGithubUrl}
            onChange={(e) =>
              onFieldChange("contributorGithubUrl", e.target.value)
            }
          />
        </>
      )}

      {data.role === "owner" && (
        <>
          <AuthTextField
            id="ownerOrganization"
            label={t("register.details.organization")}
            icon={Building2}
            dir="rtl"
            placeholder={t("register.details.organizationPlaceholder")}
            value={data.ownerOrganization}
            onChange={(e) => onFieldChange("ownerOrganization", e.target.value)}
          />
          <AuthTextField
            id="ownerIndustry"
            label={t("register.details.industry")}
            icon={Building2}
            dir="rtl"
            placeholder={t("register.details.industryPlaceholder")}
            value={data.ownerIndustry}
            onChange={(e) => onFieldChange("ownerIndustry", e.target.value)}
          />
          <ChipSelect
            label={t("register.details.teamSize")}
            options={getTeamSizeOptions(t)}
            value={data.ownerTeamSize}
            onChange={(v) => onFieldChange("ownerTeamSize", v as string)}
          />
          <AuthTextField
            id="ownerWebsite"
            label={t("register.details.website")}
            icon={Globe}
            placeholder="https://example.com"
            value={data.ownerWebsite}
            onChange={(e) => onFieldChange("ownerWebsite", e.target.value)}
          />
        </>
      )}

      <div className="flex w-full items-start gap-2 pt-1">
        <Checkbox
          id={termsId}
          className="mt-0.5"
          checked={data.agreedToTerms}
          onCheckedChange={(checked) =>
            onFieldChange("agreedToTerms", checked === true)
          }
        />
        <label
          htmlFor={termsId}
          className="flex-1 text-right text-xs text-muted-foreground leading-normal"
        >
          {t("register.details.termsText")}{" "}
          <a href="#" className="font-semibold text-primary hover:underline">
            {t("register.details.termsOfService")}
          </a>{" "}
          {t("register.details.and")}{" "}
          <a href="#" className="font-semibold text-primary hover:underline">
            {t("register.details.privacyPolicy")}
          </a>{" "}
          {t("register.details.termsOf")}
        </label>
      </div>
    </div>
  );
}
