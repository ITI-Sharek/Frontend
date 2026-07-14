import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { ChipSelect } from "@/shared/components/forms/chip-select";
import { TagInput } from "@/shared/components/forms/tag-input";
import { cn } from "@/lib/utils";

import { useUpdateProfileDetailsMutation } from "../../api/mutations/use-update-profile-details-mutation";
import { EXPERIENCE_LEVEL_LABELS, INTEREST_LABELS } from "../../constants/profile-options.constants";
import type { ContributorProfileDto } from "../../types/contributor-profile.types";

const EXPERIENCE_LEVEL_DESCRIPTIONS: Record<string, string> = {
  junior: "بدأت للتو في هذا المجال.",
  mid: "لدي خبرة عملية في مشاريع حقيقية.",
  senior: "لدي خبرة واسعة وأستطيع قيادة مهام معقدة.",
  expert: "لدي خبرة عميقة وشاملة في هذا المجال.",
};

const INTEREST_OPTIONS = Object.entries(INTEREST_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/** Settings → "الملف الشخصي": bio, availability, experience level, interests, declared skills. */
export function ContributorProfileSettingsSection({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const mutation = useUpdateProfileDetailsMutation(profile);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [availability, setAvailability] = useState(profile.availability ?? "");
  const [experienceLevel, setExperienceLevel] = useState(
    profile.experienceLevel ?? "",
  );
  const [interests, setInterests] = useState(profile.interests);
  const [declaredSkills, setDeclaredSkills] = useState(profile.declaredSkills);

  const canSave = bio.trim().length > 0 && !mutation.isPending;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        mutation.mutate({
          bio,
          availability: availability || null,
          experienceLevel: experienceLevel || null,
          interests,
          declaredSkills,
        });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-bio" className="text-right">
          النبذة التعريفية
        </Label>
        <textarea
          id="settings-profile-bio"
          dir="rtl"
          rows={4}
          maxLength={500}
          placeholder="مثال: مطور واجهات خلفية بخبرة في Node.js وPostgreSQL، أستمتع ببناء واجهات API نظيفة وأبحث عن مساهمات في مشاريع مفتوحة المصدر عربية."
          className="w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-left text-xs text-muted-foreground" dir="ltr">
          {bio.length}/500
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-availability" className="text-right">
          الإتاحة (اختياري)
        </Label>
        <input
          id="settings-profile-availability"
          dir="rtl"
          placeholder="مثال: 10 ساعات أسبوعيًا — مساءً وعطلات"
          className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-right text-sm font-medium text-foreground">
          مستوى الخبرة
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => {
            const isSelected = experienceLevel === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setExperienceLevel(value)}
                className={cn(
                  "flex flex-col gap-1 rounded-input border p-4 text-right transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span className="font-semibold text-foreground">{label}</span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {EXPERIENCE_LEVEL_DESCRIPTIONS[value]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ChipSelect
        label="مجالات الاهتمام"
        options={INTEREST_OPTIONS}
        value={interests}
        onChange={(value) => setInterests(Array.isArray(value) ? value : [value])}
        multiple
      />

      <TagInput
        label="مهارات إضافية (يدوية)"
        placeholder="اكتب مهارة واضغط Enter أو فاصلة"
        value={declaredSkills}
        onChange={setDeclaredSkills}
      />

      {mutation.isError && (
        <p className="text-right text-xs text-destructive">
          {getApiErrorMessage(mutation.error, "تعذر حفظ التغييرات. حاول مرة أخرى.")}
        </p>
      )}

      <div className="flex items-center justify-start gap-3">
        <Button type="submit" size="sm" disabled={!canSave}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>جارٍ الحفظ...</span>
            </>
          ) : mutation.isSuccess ? (
            <>
              <Check className="size-4" />
              <span>تم الحفظ</span>
            </>
          ) : (
            <span>حفظ التغييرات</span>
          )}
        </Button>
      </div>
    </form>
  );
}
