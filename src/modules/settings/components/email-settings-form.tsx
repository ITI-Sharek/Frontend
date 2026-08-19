import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthUserDto } from "@/modules/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface EmailSettingsFormProps {
  user: AuthUserDto;
}

export function EmailSettingsForm({ user }: EmailSettingsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isSavingRecovery, setIsSavingRecovery] = useState(false);
  const [recoverySaved, setRecoverySaved] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  function handleSaveRecovery(event: React.FormEvent) {
    event.preventDefault();
    // TODO: Wire this action when recovery-email storage is available.
    setIsSavingRecovery(true);
    setTimeout(() => {
      setIsSavingRecovery(false);
      setRecoverySaved(true);
      setPendingNotice(true);
    }, 600);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.email.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.email.description")}
        </p>
      </div>

      {/* Primary Email Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-muted-foreground">
            {t("settings.personal.email.primaryTitle")}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Lock className="size-3.5" />
            <span>{isArabic ? "البريد الإلكتروني مقفل" : "Email Locked"}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <p dir="ltr" className="font-mono text-base font-bold text-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? "يتم إرسال كافة التنبيهات والإشعارات المهمة إلى هذا العنوان."
                  : "All primary notifications and security alerts are sent here."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-3.5" />
            <span>{t("settings.personal.email.primaryBadge")}</span>
          </span>
        </div>

        {/* Locked Notice Banner */}
        <div className="mt-2 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/60 p-4 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col gap-1 leading-5">
            <span className="font-bold">
              {isArabic ? "لا يمكن تعديل البريد الإلكتروني" : "Email address cannot be changed"}
            </span>
            <span>
              {isArabic
                ? "عنوان البريد الإلكتروني مرتبط بحسابك بشكل دائم ومقفل لأسباب أمنية. إذا كنت ترغب في تغيير أو إزالة هذا البريد الإلكتروني، يجب عليك حذف الحساب."
                : "This email address is permanently locked to your account for security reasons. If you want to change or remove this email address, you must delete your account."}
            </span>
          </div>
        </div>
      </div>

      {pendingNotice && (
        <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {isArabic
            ? "هذه الميزة قيد التطوير ولم يتم حفظ أي تغييرات بعد."
            : "This feature is pending backend support; no changes have been saved."}
        </p>
      )}

      {/* Recovery Email Section */}
      <form onSubmit={handleSaveRecovery} className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {t("settings.personal.email.recoveryTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("settings.personal.email.recoveryHint")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-lg">
          <div className="flex flex-col gap-2">
            <Label htmlFor="recovery-email" className="text-xs font-semibold text-foreground">
              {t("settings.personal.email.recoveryLabel")}
            </Label>
            <div className="relative">
              <Mail className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="recovery-email"
                type="email"
                dir="ltr"
                value={recoveryEmail}
                onChange={(e) => {
                  setRecoveryEmail(e.target.value);
                  setRecoverySaved(false);
                }}
                placeholder={t("settings.personal.email.recoveryPlaceholder")}
                className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              type="submit"
              variant="outline"
              disabled={isSavingRecovery}
              className="gap-2 rounded-xl text-xs font-semibold"
            >
              {isSavingRecovery ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : recoverySaved ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <ShieldCheck className="size-3.5" />
              )}
              <span>
                {recoverySaved
                  ? t("settings.personal.email.savedRecovery")
                  : t("settings.personal.email.saveRecovery")}
              </span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
