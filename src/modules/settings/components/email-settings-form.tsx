import {
  BadgeCheck,
  Check,
  KeyRound,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useUpdateEmailMutation, type AuthUserDto } from "@/modules/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface EmailSettingsFormProps {
  user: AuthUserDto;
}

export function EmailSettingsForm({ user }: EmailSettingsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const updateEmail = useUpdateEmailMutation();
  const [codeSent, setCodeSent] = useState(false);
  const [isSavingRecovery, setIsSavingRecovery] = useState(false);
  const [recoverySaved, setRecoverySaved] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  function handleChangeEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!newEmail || !password) return;
    updateEmail.mutate({ email: newEmail, password }, { onSuccess: () => {
      setCodeSent(true);
    }});
  }

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
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("settings.personal.email.primaryTitle")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <p dir="ltr" className="font-mono text-sm font-bold text-foreground">
                {user.email ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "يتم إرسال كافة التنبيهات والإشعارات المهمة إلى هذا العنوان." : "All primary notifications and security alerts are sent here."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-3.5" />
            <span>{t("settings.personal.email.primaryBadge")}</span>
          </span>
        </div>
      </div>

      {pendingNotice && (
        <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-50/50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {isArabic
            ? "هذه الميزة قيد التطوير ولم يتم حفظ أي تغييرات بعد."
            : "This feature is pending backend support; no changes have been saved."}
        </p>
      )}

      {/* Change Primary Email Form */}
      <form onSubmit={handleChangeEmail} className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {t("settings.personal.email.changeTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isArabic ? "أدخل كلمة المرور الحالية لتأكيد التحديث." : "Enter your current password to confirm this update."}
          </p>
        </div>

        {codeSent ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Check className="size-4 shrink-0 text-emerald-600" />
            <span>
              {isArabic ? "تم تحديث البريد الإلكتروني إلى" : "Email updated to"} ({newEmail})
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-lg">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-email" className="text-xs font-semibold text-foreground">
                {t("settings.personal.email.newEmailLabel")} *
              </Label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-email"
                  type="email"
                  dir="ltr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t("settings.personal.email.newEmailPlaceholder")}
                  className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-email-password" className="text-xs font-semibold text-foreground">
                {t("settings.personal.email.passwordLabel")} *
              </Label>
              <div className="relative">
                <KeyRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-email-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("settings.personal.email.passwordPlaceholder")}
                  className="h-11 ps-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-start pt-1">
              <Button
                type="submit"
                disabled={updateEmail.isPending || !newEmail || !password}
                className="gap-2 rounded-xl text-xs font-semibold"
              >
                {updateEmail.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>{isArabic ? "تحديث البريد الإلكتروني" : "Update email"}</span>
              </Button>
            </div>
          </div>
        )}
      </form>

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
