import { Check, ChevronDown, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";
import { TagInput } from "@/shared/components/forms/tag-input";
import { Avatar } from "@/shared/components/ui/avatar";

import {
  useUpdateProfileDetailsMutation,
  useUploadContributorAvatarMutation,
} from "../../api/mutations/use-update-profile-details-mutation";
import { useContributorFieldsQuery } from "../../api/queries/use-contributor-fields-query";
import { useExperienceLevelsQuery } from "../../api/queries/use-experience-levels-query";
import type {
  ContributorFieldDto,
  ContributorProfileDto,
} from "../../types/contributor-profile.types";

/** Settings → profile details, dynamic fields, declared skills, and avatar. */
export function ContributorProfileSettingsSection({
  profile,
  onCancel,
  onSaved,
}: {
  profile: ContributorProfileDto;
  onCancel?: () => void;
  onSaved?: (profile: ContributorProfileDto) => void;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const mutation = useUpdateProfileDetailsMutation();
  const avatarMutation = useUploadContributorAvatarMutation();
  const fieldsQuery = useContributorFieldsQuery();
  const experienceLevelsQuery = useExperienceLevelsQuery();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [availability, setAvailability] = useState(profile.availability ?? "");
  const [experienceLevelId, setExperienceLevelId] = useState(
    profile.experienceLevel?.id ?? "",
  );
  const [fieldIds, setFieldIds] = useState(profile.fields.map((field) => field.id));
  const [declaredSkills, setDeclaredSkills] = useState(profile.declaredSkills);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fieldsByCategory = useMemo(() => {
    const groups = new Map<
      string,
      { labelAr: string; labelEn: string; fields: ContributorFieldDto[] }
    >();
    for (const field of fieldsQuery.data ?? []) {
      const category = field.category;
      const categoryId = field.categoryId ?? category?.id ?? "uncategorized";
      const current = groups.get(categoryId) ?? {
        labelAr: category?.labelAr ?? t("contributor.settings.fieldsUncategorized"),
        labelEn: category?.labelEn ?? "Uncategorized",
        fields: [],
      };
      current.fields.push(field);
      groups.set(categoryId, current);
    }
    return Array.from(groups.values());
  }, [fieldsQuery.data, t]);

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  const canSave = !mutation.isPending;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave) return;
        mutation.mutate({
          bio: bio.trim() || null,
          availability: availability || null,
          experienceLevelId: experienceLevelId || null,
          fieldIds,
          declaredSkills,
        }, { onSuccess: onSaved });
      }}
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 sm:flex-row sm:items-center">
        <Avatar
          src={avatarPreview ?? profile.avatarUrl}
          alt={profile.displayName}
          fallback={profile.displayName.charAt(0)}
          size="xl"
        />
        <div className="flex-1 text-start">
          <p className="font-semibold text-foreground">{t("contributor.settings.profileImage")}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t("contributor.settings.profileImageHint")}
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-input border border-border px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/50">
            {avatarMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {t("contributor.settings.chooseImage")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={avatarMutation.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 2_000_000) {
                  event.target.value = "";
                  return;
                }
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(URL.createObjectURL(file));
                avatarMutation.mutate(file);
              }}
            />
          </label>
          {avatarMutation.isError && (
            <p className="mt-2 text-xs text-destructive">
              {getApiErrorMessage(avatarMutation.error, t("contributor.settings.avatarUploadError"))}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-bio" className="text-start">
          {t("contributor.settings.bioLabel")}
        </Label>
        <Textarea
          id="settings-profile-bio"
          dir="auto"
          rows={4}
          maxLength={500}
          placeholder={t("contributor.settings.bioPlaceholder")}
          className="px-[17px] py-[13px] text-start text-base"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="text-end text-xs text-muted-foreground" dir="ltr">
          {bio.length}/500
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-availability" className="text-start">
          {t("contributor.settings.availabilityLabel")}
        </Label>
        <Input
          id="settings-profile-availability"
          dir="auto"
          placeholder={t("contributor.settings.availabilityPlaceholder")}
          className="h-[50px] px-[17px] text-start text-base"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-experience" className="text-start">
          {t("contributor.settings.experienceLevelLabel")}
        </Label>
        <NativeSelect
          id="settings-profile-experience"
          value={experienceLevelId}
          onChange={(event) => setExperienceLevelId(event.target.value)}
          className="text-start text-base"
        >
          <NativeSelectOption value="">
            {t("contributor.settings.experienceLevelPlaceholder")}
          </NativeSelectOption>
          {experienceLevelsQuery.data?.map((level) => (
            <NativeSelectOption key={level.id} value={level.id}>
              {isArabic ? level.labelAr : level.labelEn}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-start text-sm font-medium text-foreground">
          {t("contributor.settings.fieldsLabel")}
        </span>
        <details className="group relative">
          <summary className="flex h-[50px] cursor-pointer list-none items-center justify-between rounded-input border border-border bg-input-bg px-[17px] text-base text-foreground">
            <span>
              {fieldIds.length > 0
                ? t("contributor.settings.fieldsSelectedCount", { count: fieldIds.length })
                : t("contributor.settings.fieldsSelectPrompt")}
            </span>
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-input border border-border bg-card p-2 shadow-lg">
            {fieldsQuery.isPending ? (
              <p className="p-3 text-sm text-muted-foreground">{t("contributor.settings.fieldsLoading")}</p>
            ) : fieldsByCategory.length ? (
              fieldsByCategory.map((category) => (
                <div key={`${category.labelEn}-${category.labelAr}`} className="pb-2 last:pb-0">
                  <p className="px-3 pb-1 pt-2 text-xs font-bold text-muted-foreground">
                    {isArabic ? category.labelAr : category.labelEn}
                  </p>
                  {category.fields.map((field) => (
                    <label
                      key={field.id}
                      className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2 text-sm hover:bg-border/20"
                    >
                      <Checkbox
                        checked={fieldIds.includes(field.id)}
                        onCheckedChange={(checked) =>
                          setFieldIds((current) =>
                            checked === true
                              ? [...current, field.id]
                              : current.filter((id) => id !== field.id),
                          )
                        }
                      />
                      <span>{isArabic ? field.labelAr : field.labelEn}</span>
                    </label>
                  ))}
                </div>
              ))
            ) : (
              <p className="p-3 text-sm text-muted-foreground">
                {t("contributor.settings.fieldsEmpty")}
              </p>
            )}
          </div>
        </details>
      </div>

      <TagInput
        label={t("contributor.settings.extraSkillsLabel")}
        placeholder={t("contributor.settings.extraSkillsPlaceholder")}
        value={declaredSkills}
        onChange={setDeclaredSkills}
      />

      {mutation.isError && (
        <p className="text-start text-xs text-destructive">
          {getApiErrorMessage(mutation.error, t("contributor.settings.saveError"))}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        {onCancel && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            <X className="size-4" />
            <span>{t("common.cancel")}</span>
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!canSave}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("contributor.settings.saving")}</span>
            </>
          ) : mutation.isSuccess ? (
            <>
              <Check className="size-4" />
              <span>{t("contributor.settings.saved")}</span>
            </>
          ) : (
            <span>{t("contributor.settings.saveChanges")}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
