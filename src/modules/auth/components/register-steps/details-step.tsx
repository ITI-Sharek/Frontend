"use client";

import { Building2, Github, Globe, Wrench } from "lucide-react";
import { useId } from "react";

import { Checkbox } from "@/shared/components/ui/checkbox";

import {
  EXPERIENCE_OPTIONS,
  INTEREST_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "../../constants/signup.constants";
import type { SignupFormData } from "../../types/signup.types";
import { AuthTextField } from "../auth-text-field";
import { ChipSelect } from "../chip-select";

interface DetailsStepProps {
  data: SignupFormData;
  onFieldChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
}

export function DetailsStep({ data, onFieldChange }: DetailsStepProps) {
  const termsId = useId();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1 text-right">
        <h2 className="text-lg font-bold text-foreground">
          أخبرنا المزيد عنك
        </h2>
        <p className="text-sm text-muted-foreground">
          حقول مخصصة بناءً على دورك المختار لمساعدتك في العثور على الفرص
          المناسبة.
        </p>
      </div>

      {data.role === "contributor" && (
        <>
          <AuthTextField
            id="contributorSkills"
            label="مهاراتك التقنية"
            icon={Wrench}
            dir="rtl"
            placeholder="مثال: React, Node.js, Python"
            value={data.contributorSkills}
            onChange={(e) => onFieldChange("contributorSkills", e.target.value)}
          />
          <ChipSelect
            label="سنوات الخبرة"
            options={EXPERIENCE_OPTIONS}
            value={data.contributorExperience}
            onChange={(v) => onFieldChange("contributorExperience", v as string)}
          />
          <ChipSelect
            label="مجالات الاهتمام"
            options={INTEREST_OPTIONS}
            value={data.contributorInterests}
            onChange={(v) =>
              onFieldChange("contributorInterests", v as string[])
            }
            multiple
          />
          <AuthTextField
            id="contributorGithubUrl"
            label="رابط GitHub (اختياري)"
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
            label="اسم المشروع أو الشركة"
            icon={Building2}
            dir="rtl"
            placeholder="مثال: Share-k"
            value={data.ownerOrganization}
            onChange={(e) => onFieldChange("ownerOrganization", e.target.value)}
          />
          <AuthTextField
            id="ownerIndustry"
            label="مجال العمل"
            icon={Building2}
            dir="rtl"
            placeholder="مثال: تعليم، تقنية مالية"
            value={data.ownerIndustry}
            onChange={(e) => onFieldChange("ownerIndustry", e.target.value)}
          />
          <ChipSelect
            label="حجم الفريق"
            options={TEAM_SIZE_OPTIONS}
            value={data.ownerTeamSize}
            onChange={(v) => onFieldChange("ownerTeamSize", v as string)}
          />
          <AuthTextField
            id="ownerWebsite"
            label="الموقع الإلكتروني (اختياري)"
            icon={Globe}
            placeholder="https://example.com"
            value={data.ownerWebsite}
            onChange={(e) => onFieldChange("ownerWebsite", e.target.value)}
          />
        </>
      )}

      <div className="flex w-full items-start gap-2 pt-2">
        <Checkbox
          id={termsId}
          className="mt-1"
          checked={data.agreedToTerms}
          onCheckedChange={(checked) =>
            onFieldChange("agreedToTerms", checked === true)
          }
        />
        <label
          htmlFor={termsId}
          className="flex-1 text-right text-sm text-muted-foreground"
        >
          أوافق على{" "}
          <a href="#" className="font-semibold text-primary">
            شروط الخدمة
          </a>{" "}
          و{" "}
          <a href="#" className="font-semibold text-primary">
            سياسة الخصوصية
          </a>{" "}
          الخاصة بـ Share-k.
        </label>
      </div>
    </div>
  );
}
