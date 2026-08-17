import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useChangePasswordMutation, type AuthUserDto } from "@/modules/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";

interface ChangePasswordFormProps {
  user: AuthUserDto;
}

export function ChangePasswordForm({ user }: ChangePasswordFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changePassword = useChangePasswordMutation();
  void user;

  // Validation rules
  const hasLength = newPassword.length >= 8;
  const hasMixed = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCount = [hasLength, hasMixed, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  let strengthLabel = t("settings.personal.password.strength.weak");
  let strengthColor = "bg-destructive text-destructive";
  let strengthWidth = "w-1/4";

  if (passedCount >= 4) {
    strengthLabel = t("settings.personal.password.strength.strong");
    strengthColor = "bg-emerald-500 text-emerald-600 dark:text-emerald-400";
    strengthWidth = "w-full";
  } else if (passedCount >= 2) {
    strengthLabel = t("settings.personal.password.strength.medium");
    strengthColor = "bg-amber-500 text-amber-600 dark:text-amber-400";
    strengthWidth = "w-2/3";
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t("settings.personal.password.mismatch"));
      return;
    }

    if (passedCount < 2) {
      setError(
        isArabic
          ? "يرجى اختيار كلمة مرور أقوى تلبي المعايير الموضحة أدناه."
          : "Please choose a stronger password matching the criteria below.",
      );
      return;
    }

    changePassword.mutate({ currentPassword, newPassword }, { onSuccess: () => {
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }});
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.password.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.password.description")}
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-lg">
        {/* Current Password */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="current-password"
            className="text-sm font-semibold text-foreground"
          >
            {t("settings.personal.password.currentPassword")} *
          </Label>
          <div className="relative">
            <KeyRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="current-password"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setSaved(false);
                setError(null);
              }}
              placeholder={t(
                "settings.personal.password.currentPasswordPlaceholder",
              )}
              className="h-11 px-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="new-password"
            className="text-sm font-semibold text-foreground"
          >
            {t("settings.personal.password.newPassword")} *
          </Label>
          <div className="relative">
            <KeyRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setSaved(false);
                setError(null);
              }}
              placeholder={t(
                "settings.personal.password.newPasswordPlaceholder",
              )}
              className="h-11 px-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="mt-2 flex flex-col gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  {t("settings.personal.password.strength.label")}
                </span>
                <span className={cn("font-bold", strengthColor.split(" ")[1])}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    strengthColor.split(" ")[0],
                    strengthWidth,
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirm-password"
            className="text-sm font-semibold text-foreground"
          >
            {t("settings.personal.password.confirmPassword")} *
          </Label>
          <div className="relative">
            <KeyRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setSaved(false);
                setError(null);
              }}
              placeholder={t(
                "settings.personal.password.confirmPasswordPlaceholder",
              )}
              className="h-11 px-10 rounded-xl border-border bg-background text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-foreground">
            <ShieldCheck className="size-4 text-primary" />
            <span>{t("settings.personal.password.rules.title")}</span>
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-white",
                  hasLength ? "bg-emerald-500" : "bg-muted-foreground/30",
                )}
              >
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span className={cn(hasLength && "text-foreground font-medium")}>
                {t("settings.personal.password.rules.length")}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-white",
                  hasMixed ? "bg-emerald-500" : "bg-muted-foreground/30",
                )}
              >
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span className={cn(hasMixed && "text-foreground font-medium")}>
                {t("settings.personal.password.rules.mixed")}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-white",
                  hasNumber ? "bg-emerald-500" : "bg-muted-foreground/30",
                )}
              >
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span className={cn(hasNumber && "text-foreground font-medium")}>
                {t("settings.personal.password.rules.number")}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-white",
                  hasSpecial ? "bg-emerald-500" : "bg-muted-foreground/30",
                )}
              >
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <span className={cn(hasSpecial && "text-foreground font-medium")}>
                {t("settings.personal.password.rules.special")}
              </span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={changePassword.isPending}
          className="min-w-[190px] gap-2 rounded-xl text-sm font-semibold shadow-xs"
        >
          {changePassword.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{isArabic ? "جارٍ التحديث..." : "Updating..."}</span>
            </>
          ) : saved ? (
            <>
              <Check className="size-4 text-emerald-300" />
              <span>{t("settings.personal.password.saved")}</span>
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              <span>{t("settings.personal.password.save")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
