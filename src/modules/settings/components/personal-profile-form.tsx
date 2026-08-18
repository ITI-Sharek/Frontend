import {
  Briefcase,
  Building2,
  Check,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthUserDto } from "@/modules/auth";
import {
  useContributorFieldsQuery,
  useUpdateProfileDetailsMutation

} from "@/modules/contributors";
import type {ContributorProfileDto} from "@/modules/contributors";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PersonalProfileFormProps {
  user: AuthUserDto;
  profile?: ContributorProfileDto;
}

export function PersonalProfileForm({ user, profile }: PersonalProfileFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [accountType, setAccountType] = useState<"provider" | "buyer">(
    user.role === "owner" ? "buyer" : "provider",
  );
  const [specialty, setSpecialty] = useState(
    profile?.fields[0]?.key ?? profile?.experienceLevel?.key ?? "",
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saved, setSaved] = useState(false);
  const updateProfile = useUpdateProfileDetailsMutation();
  const fieldsQuery = useContributorFieldsQuery();

  useEffect(() => {
    setAccountType(user.role === "owner" ? "buyer" : "provider");
    setSpecialty(profile?.fields[0]?.key ?? profile?.experienceLevel?.key ?? "");
    setBio(profile?.bio ?? "");
    setSaved(false);
  }, [profile, user.role]);

  const bioTemplates = isArabic
    ? [
        "مطور واجهات أمامية متخصص في React و Next.js",
        "مهندس برمجيات Backend وخبير في نظم البيانات",
        "شغوف بالمشاريع مفتوحة المصدر والبرمجة التشاركية",
      ]
    : [
        "Frontend Engineer specialized in React & Next.js",
        "Backend Developer with deep database expertise",
        "Passionate open-source contributor and collaborator",
      ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (user.role !== "contributor") return;

    const initialFieldId = profile?.fields[0]?.id;
    const selectedField = fieldsQuery.data?.find((field) => field.key === specialty);
    const fieldIds = selectedField
      ? [
          selectedField.id,
          ...(profile?.fields
            .filter((field) => field.id !== initialFieldId)
            .map((field) => field.id) ?? []),
        ]
      : (profile?.fields.map((field) => field.id) ?? []);

    updateProfile.mutate(
      {
        bio: bio.trim() || null,
        availability: profile?.availability ?? null,
        experienceLevelId: profile?.experienceLevel?.id ?? null,
        fieldIds,
        declaredSkills: profile?.declaredSkills ?? [],
      },
      { onSuccess: () => setSaved(true) },
    );
  }

  function handleReset() {
    setBio(profile?.bio ?? "");
    setSpecialty(profile?.fields[0]?.key ?? profile?.experienceLevel?.key ?? "");
    setAccountType(user.role === "owner" ? "buyer" : "provider");
    setSaved(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.profile.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.subtitle")}
        </p>
      </div>

      {/* Account Type Selection */}
      <div className="flex flex-col gap-3.5">
        <Label className="text-sm font-semibold text-foreground">
          {t("settings.personal.profile.accountTypeLabel")}
        </Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Provider Card */}
          <button
            type="button"
            disabled
            aria-pressed={accountType === "provider"}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-start transition-all",
              accountType === "provider"
                ? "border-primary bg-primary/[0.04] shadow-xs ring-2 ring-primary/20 dark:bg-primary/[0.08]"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-colors",
                  accountType === "provider"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Sparkles className="size-5" />
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t("settings.personal.profile.providerBadge")}
              </span>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {t("settings.personal.profile.provider")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("settings.personal.profile.providerDescription")}
              </p>
            </div>
          </button>

          {/* Buyer Card */}
          <button
            type="button"
            disabled
            aria-pressed={accountType === "buyer"}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-start transition-all",
              accountType === "buyer"
                ? "border-primary bg-primary/[0.04] shadow-xs ring-2 ring-primary/20 dark:bg-primary/[0.08]"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-colors",
                  accountType === "buyer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Building2 className="size-5" />
              </span>
            </div>
            <div>
              <p className="font-bold text-foreground">
                {t("settings.personal.profile.buyer")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("settings.personal.profile.buyerDescription")}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Specialty Field */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="personal-specialty" className="text-sm font-semibold text-foreground">
          {t("settings.personal.profile.specialty")}
        </Label>
        <div className="relative">
          <NativeSelect
            id="personal-specialty"
            value={specialty}
            onChange={(event) => {
              setSpecialty(event.target.value);
              setSaved(false);
            }}
            className="h-12 w-full rounded-xl border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {specialty && ![
              "softwareEngineer",
              "frontendDeveloper",
              "backendDeveloper",
              "fullstackDeveloper",
              "designer",
              "devopsEngineer",
              "mobileDeveloper",
              "projectManager",
            ].includes(specialty) && (
              <NativeSelectOption value={specialty}>{specialty}</NativeSelectOption>
            )}
            <NativeSelectOption value="">
              {isArabic ? "اختر تخصصًا" : "Select a specialty"}
            </NativeSelectOption>
            <NativeSelectOption value="softwareEngineer">
              {t("settings.personal.profile.softwareEngineer")}
            </NativeSelectOption>
            <NativeSelectOption value="frontendDeveloper">
              {t("settings.personal.profile.frontendDeveloper")}
            </NativeSelectOption>
            <NativeSelectOption value="backendDeveloper">
              {t("settings.personal.profile.backendDeveloper")}
            </NativeSelectOption>
            <NativeSelectOption value="fullstackDeveloper">
              {t("settings.personal.profile.fullstackDeveloper")}
            </NativeSelectOption>
            <NativeSelectOption value="designer">
              {t("settings.personal.profile.designer")}
            </NativeSelectOption>
            <NativeSelectOption value="devopsEngineer">
              {t("settings.personal.profile.devopsEngineer")}
            </NativeSelectOption>
            <NativeSelectOption value="mobileDeveloper">
              {t("settings.personal.profile.mobileDeveloper")}
            </NativeSelectOption>
            <NativeSelectOption value="projectManager">
              {t("settings.personal.profile.projectManager")}
            </NativeSelectOption>
          </NativeSelect>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("settings.personal.profile.specialtyHint")}
        </p>
      </div>

      {updateProfile.isError && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {getApiErrorMessage(
            updateProfile.error,
            isArabic ? "تعذر حفظ الملف الشخصي. حاول مرة أخرى." : "We couldn't save your profile. Please try again.",
          )}
        </p>
      )}

      {/* Bio Textarea */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="personal-bio" className="text-sm font-semibold text-foreground">
            {t("settings.personal.profile.bio")}
          </Label>
          <span className="font-mono text-xs text-muted-foreground" dir="ltr">
            {bio.length} / 1000
          </span>
        </div>
        <Textarea
          id="personal-bio"
          value={bio}
          onChange={(event) => {
            setBio(event.target.value);
            setSaved(false);
          }}
          rows={7}
          maxLength={1000}
          placeholder={t("settings.personal.profile.bioHint")}
          className="resize-none rounded-xl border-border bg-background p-4 text-sm leading-7 text-foreground shadow-xs transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {/* Quick Inspiration Tags */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {isArabic ? "إلهام سريع:" : "Quick add:"}
          </span>
          {bioTemplates.map((template, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setBio((current) =>
                  current.trim() ? `${current}\n\n• ${template}` : template,
                );
                setSaved(false);
              }}
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              + {template}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2 rounded-xl text-sm"
        >
          <RotateCcw className="size-4" />
          <span>{isArabic ? "استعادة الافتراضي" : "Reset Default"}</span>
        </Button>

        <Button
          type="submit"
          disabled={updateProfile.isPending || user.role !== "contributor"}
          className="min-w-[170px] gap-2 rounded-xl text-sm font-semibold"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{isArabic ? "جارٍ الحفظ..." : "Saving..."}</span>
            </>
          ) : saved ? (
            <>
              <Check className="size-4 text-emerald-300" />
              <span>{t("settings.personal.saved")}</span>
            </>
          ) : (
            <>
              <Briefcase className="size-4" />
              <span>{t("settings.personal.save")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
