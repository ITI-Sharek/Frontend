import {
  AlertCircle,
  BadgeCheck,
  Check,
  Loader2,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdatePhoneMutation  } from "@/modules/auth";
import type {AuthUserDto} from "@/modules/auth";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";

interface PhoneSettingsFormProps {
  user: AuthUserDto;
}

export function PhoneSettingsForm({ user }: PhoneSettingsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [countryCode, setCountryCode] = useState("+20");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [enable2fa, setEnable2fa] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updatePhone = useUpdatePhoneMutation();

  const currentPhone = user.phoneNumber?.trim() || null;
  const isVerified = Boolean(user.phoneVerifiedAt && currentPhone);

  function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    const sanitizedNumber = phoneNumber.replace(/\D/g, "").replace(/^0+/, "");
    if (!sanitizedNumber) return;

    const fullNumber = `${countryCode}${sanitizedNumber}`;
    updatePhone.mutate(fullNumber, {
      onSuccess: () => {
        setCodeSent(true);
      },
      onError: (err: unknown) => {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err).message)
            : isArabic
              ? "تعذر تحديث رقم الهاتف، يرجى المحاولة مرة أخرى."
              : "Could not update phone number. Please try again.";
        setSubmitError(message);
      },
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.phone.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.phone.description")}
        </p>
      </div>

      {/* Current Phone Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("settings.personal.phone.currentTitle")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="size-5" />
            </span>
            <div>
              <p dir="ltr" className="font-mono text-sm font-bold text-foreground">
                {currentPhone ?? (isArabic ? "لا يوجد رقم هاتف مسجل" : "No phone on file")}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? "يُستخدم لاسترداد الحساب وتأكيد العمليات الحساسة."
                  : "Used for account recovery and sensitive action confirmations."}
              </p>
            </div>
          </div>
          {currentPhone && (
            isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="size-3.5" />
                <span>{t("settings.personal.phone.verifiedBadge")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-3.5" />
                <span>{isArabic ? "غير موثّق" : "Unverified"}</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Update Phone Number Form */}
      <div className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {t("settings.personal.phone.updateTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isArabic
              ? "أدخل رقم هاتفك الجديد وسنرسل رمز تأكيد مكونًا من 6 أرقام."
              : "Enter your new phone number and we will send a 6-digit confirmation code."}
          </p>
        </div>

        {codeSent ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Check className="size-4 shrink-0 text-emerald-600" />
            <span>
              {isArabic
                ? `تم تحديث رقم الهاتف بنجاح إلى (${countryCode}${phoneNumber.replace(/\D/g, "").replace(/^0+/, "")})`
                : `Phone number successfully updated to (${countryCode}${phoneNumber.replace(/\D/g, "").replace(/^0+/, "")})`}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSendCode} className="grid grid-cols-1 gap-4 max-w-lg">
            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone-number" className="text-xs font-semibold text-foreground">
                {t("settings.personal.phone.phoneLabel")} *
              </Label>
              <div className="flex items-center gap-2" dir="ltr">
                <NativeSelect
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  wrapperClassName="w-36 shrink-0"
                  className="h-11 rounded-xl border-border bg-background px-3 text-xs font-semibold"
                >
                  <NativeSelectOption value="+20">🇪🇬 +20</NativeSelectOption>
                  <NativeSelectOption value="+966">🇸🇦 +966</NativeSelectOption>
                  <NativeSelectOption value="+971">🇦🇪 +971</NativeSelectOption>
                  <NativeSelectOption value="+962">🇯🇴 +962</NativeSelectOption>
                  <NativeSelectOption value="+212">🇲🇦 +212</NativeSelectOption>
                  <NativeSelectOption value="+965">🇰🇼 +965</NativeSelectOption>
                </NativeSelect>

                <div className="relative flex-1 min-w-0">
                  <Smartphone className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone-number"
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t("settings.personal.phone.phonePlaceholder")}
                    className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-1">
              <Button
                type="submit"
                disabled={updatePhone.isPending || !phoneNumber.trim()}
                className="gap-2 rounded-xl text-xs font-semibold"
              >
                {updatePhone.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>
                  {isArabic ? "حفظ رقم الهاتف" : "Save phone number"}
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 2FA Security Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {t("settings.personal.phone.twoFactorTitle")}
              </h3>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={enable2fa}
                  onCheckedChange={(c) => setEnable2fa(c === true)}
                />
                <span className="text-xs font-semibold text-foreground">
                  {t("settings.personal.phone.enable2fa")}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("settings.personal.phone.twoFactorDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
