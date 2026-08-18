import {
  BadgeCheck,
  Calendar,
  Check,
  Globe2,
  ImagePlus,
  Loader2,
  MapPin,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthUserDto } from "@/modules/auth";
import {
  useUploadContributorAvatarMutation

} from "@/modules/contributors";
import type {ContributorProfileDto} from "@/modules/contributors";
import { useUpdatePersonalDetailsMutation } from "@/modules/auth";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import {
  getCityOptions,
  getCountryOptions,
  getStateOptions,
  normalizeCity,
  normalizeCountry,
  normalizeState,
} from "@/shared/utils/location";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { cn } from "@/lib/utils";

interface PersonalDetailsFormProps {
  user: AuthUserDto;
  profile?: ContributorProfileDto;
}

interface PersonalDetailsValues {
  firstName: string;
  lastName: string;
  country: string;
  region: string;
  city: string;
  gender: "male" | "female";
  day: string;
  month: string;
  year: string;
}

const MONTH_OPTIONS = [
  { value: "01", ar: "01 - يناير", en: "01 - January" },
  { value: "02", ar: "02 - فبراير", en: "02 - February" },
  { value: "03", ar: "03 - مارس", en: "03 - March" },
  { value: "04", ar: "04 - أبريل", en: "04 - April" },
  { value: "05", ar: "05 - مايو", en: "05 - May" },
  { value: "06", ar: "06 - يونيو", en: "06 - June" },
  { value: "07", ar: "07 - يوليو", en: "07 - July" },
  { value: "08", ar: "08 - أغسطس", en: "08 - August" },
  { value: "09", ar: "09 - سبتمبر", en: "09 - September" },
  { value: "10", ar: "10 - أكتوبر", en: "10 - October" },
  { value: "11", ar: "11 - نوفمبر", en: "11 - November" },
  { value: "12", ar: "12 - ديسمبر", en: "12 - December" },
] as const;

const YEARS = Array.from({ length: 65 }, (_, index) => String(2015 - index));
const DAYS = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export function PersonalDetailsForm({ user, profile }: PersonalDetailsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const isIdentityVerified = user.identityVerificationStatus === "verified";

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const avatarMutation = useUploadContributorAvatarMutation();
  const updateDetails = useUpdatePersonalDetailsMutation();

  const initialCountry = normalizeCountry(user.country);
  const initialState = normalizeState(initialCountry, user.region);
  const initialCity = normalizeCity(initialCountry, initialState, user.city);

  const [values, setValues] = useState<PersonalDetailsValues>(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    country: initialCountry,
    region: initialState,
    city: initialCity,
    gender: user.gender === "female" ? "female" : "male",
    day: user.dateOfBirth?.slice(8, 10) ?? "16",
    month: user.dateOfBirth?.slice(5, 7) ?? "10",
    year: user.dateOfBirth?.slice(0, 4) ?? "2001",
  }));

  useEffect(() => {
    const country = normalizeCountry(user.country);
    const region = normalizeState(country, user.region);

    setValues((current) => ({
      ...current,
      firstName: user.firstName,
      lastName: user.lastName,
      country,
      region,
      city: normalizeCity(country, region, user.city),
      gender: user.gender === "female" ? "female" : "male",
      day: user.dateOfBirth?.slice(8, 10) ?? "16",
      month: user.dateOfBirth?.slice(5, 7) ?? "10",
      year: user.dateOfBirth?.slice(0, 4) ?? "2001",
    }));
  }, [
    user.city,
    user.country,
    user.dateOfBirth,
    user.firstName,
    user.gender,
    user.lastName,
    user.region,
  ]);

  const countryOptions = useMemo(() => getCountryOptions(isArabic), [isArabic]);
  const stateOptions = useMemo(
    () => getStateOptions(values.country, isArabic),
    [values.country, isArabic],
  );
  const cityOptions = useMemo(
    () => getCityOptions(values.country, values.region, isArabic),
    [values.country, values.region, isArabic],
  );

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  function updateValue<TKey extends keyof PersonalDetailsValues>(
    key: TKey,
    value: PersonalDetailsValues[TKey],
  ) {
    setSaved(false);
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleCountryChange(newCountry: string) {
    setSaved(false);
    const normalizedCountryCode = normalizeCountry(newCountry);
    const availableStates = getStateOptions(normalizedCountryCode, isArabic);
    const newRegion = availableStates[0]?.value ?? "";
    const availableCities = getCityOptions(normalizedCountryCode, newRegion, isArabic);
    const newCity = availableCities[0]?.value ?? "";

    setValues((current) => ({
      ...current,
      country: normalizedCountryCode,
      region: newRegion,
      city: newCity,
    }));
  }

  function handleRegionChange(newRegion: string) {
    setSaved(false);
    const availableCities = getCityOptions(values.country, newRegion, isArabic);
    const newCity = availableCities[0]?.value ?? "";

    setValues((current) => ({
      ...current,
      region: newRegion,
      city: newCity,
    }));
  }

  function handleCityChange(newCity: string) {
    setSaved(false);
    setValues((current) => ({
      ...current,
      city: newCity,
    }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      alert(t("settings.personal.fields.avatarHint"));
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(previewUrl);
    setSaved(false);
    avatarMutation.mutate(file);
  }

  function handleRemoveAvatar() {
    // TODO: Wire this action when a delete-avatar endpoint is available.
    setAvatarPreview(null);
    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateDetails.mutate({
      firstName: values.firstName, lastName: values.lastName, country: values.country,
      region: values.region, city: values.city, gender: values.gender,
      dateOfBirth: `${values.year}-${values.month}-${values.day}`,
    }, { onSuccess: () => setSaved(true) });
  }

  const currentAvatarSrc =
    avatarPreview ?? profile?.avatarUrl ?? user.avatarUrl ?? undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.description")}
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/30 p-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <Avatar
            src={currentAvatarSrc}
            alt={t("settings.personal.avatarAlt")}
            fallback={
              [user.firstName.charAt(0), user.lastName.charAt(0)]
                .filter(Boolean)
                .join("") || "U"
            }
            size="xl"
            className="size-24 ring-4 ring-background shadow-sm sm:size-28"
          />
          {isIdentityVerified && (
            <span
              className="absolute -bottom-1 -end-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-background"
              title={t("settings.personal.identity.verified")}
            >
              <BadgeCheck className="size-4" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-start">
          <div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <p className="font-bold text-foreground">
                {t("settings.personal.avatarAlt")}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("settings.personal.fields.avatarHint")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
              <ImagePlus className="size-4" />
              <span>{t("settings.personal.fields.avatarUpload")}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={avatarMutation.isPending}
                onChange={handleFileChange}
              />
            </label>

            {currentAvatarSrc && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveAvatar}
                className="h-8 gap-1.5 rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>{t("settings.personal.fields.avatarRemove")}</span>
              </Button>
            )}
          </div>
          {avatarMutation.isError && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {getApiErrorMessage(
                avatarMutation.error,
                isArabic ? "تعذر رفع الصورة. حاول مرة أخرى." : "We couldn't upload your avatar. Please try again.",
              )}
            </p>
          )}
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="personal-first-name"
            className="text-sm font-semibold text-foreground"
          >
            {t("settings.personal.fields.firstName")} *
          </Label>
          <div className="relative">
            <User className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="personal-first-name"
              value={values.firstName}
              onChange={(event) => updateValue("firstName", event.target.value)}
              className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="personal-last-name"
            className="text-sm font-semibold text-foreground"
          >
            {t("settings.personal.fields.lastName")} *
          </Label>
          <div className="relative">
            <User className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="personal-last-name"
              value={values.lastName}
              onChange={(event) => updateValue("lastName", event.target.value)}
              className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </div>
      </div>

      {/* Location Cascade */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Country */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="personal-country"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <Globe2 className="size-3.5 text-muted-foreground" />
            <span>{t("settings.personal.fields.country")} *</span>
          </Label>
          <NativeSelect
            id="personal-country"
            value={values.country}
            onChange={(event) => handleCountryChange(event.target.value)}
            className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {countryOptions.map((country) => (
              <NativeSelectOption key={country.value} value={country.value}>
                {country.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {/* Region */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="personal-region"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>{t("settings.personal.fields.region")} *</span>
          </Label>
          {stateOptions.length > 0 ? (
            <NativeSelect
              id="personal-region"
              value={values.region}
              onChange={(event) => handleRegionChange(event.target.value)}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {stateOptions.map((state) => (
                <NativeSelectOption key={state.value} value={state.value}>
                  {state.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          ) : (
            <Input
              id="personal-region"
              value={values.region}
              onChange={(event) => updateValue("region", event.target.value)}
              placeholder={t("settings.personal.fields.region")}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="personal-city"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <MapPin className="size-3.5 text-muted-foreground" />
            <span>{t("settings.personal.fields.city")}</span>
          </Label>
          {cityOptions.length > 0 ? (
            <NativeSelect
              id="personal-city"
              value={values.city}
              onChange={(event) => handleCityChange(event.target.value)}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {values.city && !cityOptions.some((c) => c.value === values.city) && (
                <NativeSelectOption value={values.city}>
                  {values.city}
                </NativeSelectOption>
              )}
              {cityOptions.map((city) => (
                <NativeSelectOption key={city.value} value={city.value}>
                  {city.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          ) : (
            <Input
              id="personal-city"
              value={values.city}
              onChange={(event) => handleCityChange(event.target.value)}
              placeholder={t("settings.personal.fields.city")}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          )}
        </div>
      </div>

      {/* Gender Selection Cards */}
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-foreground">
          {t("settings.personal.fields.gender")}
        </Label>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {/* Male Card */}
          <button
            type="button"
            onClick={() => updateValue("gender", "male")}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3.5 transition-all text-start",
              values.gender === "male"
                ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  values.gender === "male"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <User className="size-4" />
              </span>
              <span className="text-sm font-bold text-foreground">
                {t("settings.personal.gender.male")}
              </span>
            </div>
            <div
              className={cn(
                "size-4 rounded-full border flex items-center justify-center transition-colors",
                values.gender === "male"
                  ? "border-primary bg-primary text-white"
                  : "border-muted-foreground/40",
              )}
            >
              {values.gender === "male" && <div className="size-1.5 rounded-full bg-white" />}
            </div>
          </button>

          {/* Female Card */}
          <button
            type="button"
            onClick={() => updateValue("gender", "female")}
            className={cn(
              "flex items-center justify-between rounded-xl border p-3.5 transition-all text-start",
              values.gender === "female"
                ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20"
                : "border-border bg-card hover:bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  values.gender === "female"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <UserCheck className="size-4" />
              </span>
              <span className="text-sm font-bold text-foreground">
                {t("settings.personal.gender.female")}
              </span>
            </div>
            <div
              className={cn(
                "size-4 rounded-full border flex items-center justify-center transition-colors",
                values.gender === "female"
                  ? "border-primary bg-primary text-white"
                  : "border-muted-foreground/40",
              )}
            >
              {values.gender === "female" && <div className="size-1.5 rounded-full bg-white" />}
            </div>
          </button>
        </div>
      </div>

      {/* Date of Birth Selection */}
      <div className="flex flex-col gap-2.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Calendar className="size-3.5 text-muted-foreground" />
          <span>{t("settings.personal.fields.birthDate")}</span>
        </Label>
        <div className="grid grid-cols-3 gap-3 max-w-xl">
          {/* Day */}
          <div>
            <NativeSelect
              aria-label={t("settings.personal.fields.day")}
              value={values.day}
              onChange={(event) => updateValue("day", event.target.value)}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {DAYS.map((day) => (
                <NativeSelectOption key={day} value={day}>
                  {day}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Month */}
          <div>
            <NativeSelect
              aria-label={t("settings.personal.fields.month")}
              value={values.month}
              onChange={(event) => updateValue("month", event.target.value)}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {MONTH_OPTIONS.map((month) => (
                <NativeSelectOption key={month.value} value={month.value}>
                  {isArabic ? month.ar : month.en}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Year */}
          <div>
            <NativeSelect
              aria-label={t("settings.personal.fields.year")}
              value={values.year}
              onChange={(event) => updateValue("year", event.target.value)}
              className="h-11 rounded-xl border-border bg-background px-3 text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {YEARS.map((year) => (
                <NativeSelectOption key={year} value={year}>
                  {year}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={updateDetails.isPending}
          className="min-w-[180px] gap-2 rounded-xl text-sm font-semibold shadow-xs"
        >
          {updateDetails.isPending ? (
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
              <UserCheck className="size-4" />
              <span>{t("settings.personal.save")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
