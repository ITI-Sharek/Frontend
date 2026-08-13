import { Check, ChevronDown, ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { TagInput } from "@/shared/components/forms/tag-input";
import { Avatar } from "@/shared/components/ui/avatar";

import {
  useUpdateProfileDetailsMutation,
  useUploadContributorAvatarMutation,
} from "../../api/mutations/use-update-profile-details-mutation";
import { useContributorFieldsQuery } from "../../api/queries/use-contributor-fields-query";
import { useExperienceLevelsQuery } from "../../api/queries/use-experience-levels-query";
import type { ContributorProfileDto } from "../../types/contributor-profile.types";

/** Settings → profile details, dynamic fields, declared skills, and avatar. */
export function ContributorProfileSettingsSection({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
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

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

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
          experienceLevelId: experienceLevelId || null,
          fieldIds,
          declaredSkills,
        });
      }}
    >
      <div className="flex flex-col gap-3 rounded-input border border-border p-4 sm:flex-row sm:items-center">
        <Avatar
          src={avatarPreview ?? profile.avatarUrl}
          alt={profile.displayName}
          fallback={profile.displayName.charAt(0)}
          size="xl"
        />
        <div className="flex-1 text-right">
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
        <Label htmlFor="settings-profile-bio" className="text-right">
          {t("contributor.settings.bioLabel")}
        </Label>
        <textarea
          id="settings-profile-bio"
          dir="rtl"
          rows={4}
          maxLength={500}
          placeholder={t("contributor.settings.bioPlaceholder")}
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
          {t("contributor.settings.availabilityLabel")}
        </Label>
        <input
          id="settings-profile-availability"
          dir="rtl"
          placeholder={t("contributor.settings.availabilityPlaceholder")}
          className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-right text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="settings-profile-experience" className="text-right">
          {t("contributor.settings.experienceLevelLabel")}
        </Label>
        <select
          id="settings-profile-experience"
          value={experienceLevelId}
          onChange={(event) => setExperienceLevelId(event.target.value)}
          className="h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] text-right text-base text-foreground outline-none"
        >
          <option value="">{t("contributor.settings.experienceLevelPlaceholder")}</option>
          {experienceLevelsQuery.data?.map((level) => (
            <option key={level.id} value={level.id}>
              {level.labelAr}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-right text-sm font-medium text-foreground">
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
            ) : fieldsQuery.data?.length ? (
              fieldsQuery.data.map((field) => (
                <label
                  key={field.id}
                  className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2 text-sm hover:bg-border/20"
                >
                  <input
                    type="checkbox"
                    checked={fieldIds.includes(field.id)}
                    onChange={(event) =>
                      setFieldIds((current) =>
                        event.target.checked
                          ? [...current, field.id]
                          : current.filter((id) => id !== field.id),
                      )
                    }
                  />
                  <span>{field.labelAr}</span>
                </label>
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
        <p className="text-right text-xs text-destructive">
          {getApiErrorMessage(mutation.error, t("contributor.settings.saveError"))}
        </p>
      )}

      <div className="flex items-center justify-start gap-3">
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
