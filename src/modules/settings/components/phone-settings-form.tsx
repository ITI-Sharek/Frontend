import {
  BadgeCheck,
  Loader2,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdatePhoneMutation, type AuthUserDto } from "@/modules/auth";
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
  const updatePhone = useUpdatePhoneMutation();
  // TODO: Replace this with the API's verified-phone field when it exists.
  const verifiedPhone = user.phoneVerifiedAt ? user.phoneNumber ?? null : null;

  function handleSendCode(event: React.FormEvent) {
    event.preventDefault();
    updatePhone.mutate(`${countryCode}${phoneNumber.replace(/^0+/, "")}`);
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
                {verifiedPhone ?? (isArabic ? "لا يوجد رقم هاتف مسجل" : "No phone on file")}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "يُستخدم لاسترداد الحساب وتأكيد العمليات الحساسة." : "Used for account recovery and sensitive action confirmations."}
              </p>
            </div>
          </div>
          {verifiedPhone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="size-3.5" />
              <span>{t("settings.personal.phone.verifiedBadge")}</span>
            </span>
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
            {isArabic ? "أدخل رقم هاتفك الجديد وسنرسل رمز تأكيد مكونًا من 6 أرقام." : "Enter your new phone number and we will send a 6-digit confirmation code."}
          </p>
        </div>

        <form onSubmit={handleSendCode} className="grid grid-cols-1 gap-4 max-w-lg">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone-number" className="text-xs font-semibold text-foreground">
              {t("settings.personal.phone.phoneLabel")} *
            </Label>
            <div className="flex gap-2" dir="ltr">
              <NativeSelect
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="h-11 w-32 shrink-0 rounded-xl border-border bg-background px-2 text-xs font-semibold"
              >
                <NativeSelectOption value="+20">🇪🇬 +20</NativeSelectOption>
                <NativeSelectOption value="+966">🇸🇦 +966</NativeSelectOption>
                <NativeSelectOption value="+971">🇦🇪 +971</NativeSelectOption>
                <NativeSelectOption value="+962">🇯🇴 +962</NativeSelectOption>
                <NativeSelectOption value="+212">🇲🇦 +212</NativeSelectOption>
                <NativeSelectOption value="+965">🇰🇼 +965</NativeSelectOption>
              </NativeSelect>

              <div className="relative flex-1">
                <Smartphone className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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

          <div className="flex justify-start">
            <Button
              type="submit"
              disabled={updatePhone.isPending || !phoneNumber}
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
