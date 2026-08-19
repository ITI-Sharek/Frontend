import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, RefreshCw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import { AuthPasswordField } from "./auth-password-field";
import { AuthTextField } from "./auth-text-field";
import { forgotPassword, resetPassword } from "../services/auth.service";

type Step = "email" | "reset" | "success";

export function ForgotPasswordForm() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const canSubmitEmail = email.trim().length > 0;
  const canSubmitReset =
    code.trim().length === 6 &&
    newPassword.length >= 8 &&
    confirmPassword.length >= 8;

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitEmail || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setStep("reset");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isArabic
            ? "تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى."
            : "Could not send reset code. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitReset || isSubmitting) return;

    if (newPassword !== confirmPassword) {
      setSubmitError(
        isArabic
          ? "كلمتا المرور غير متطابقتين."
          : "Passwords do not match.",
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });
      setStep("success");
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isArabic
            ? "رمز التحقق غير صالح أو منتهي الصلاحية."
            : "Reset code is invalid or expired.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (resendLoading || !email) return;
    setResendLoading(true);
    setResendNotice(null);
    setSubmitError(null);
    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setResendNotice(
        isArabic
          ? "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني."
          : "A new reset code has been sent to your email.",
      );
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(
          error,
          isArabic
            ? "تعذر إعادة إرسال الرمز. يرجى المحاولة لاحقاً."
            : "Could not resend reset code.",
        ),
      );
    } finally {
      setResendLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-foreground">
            {isArabic ? "تمت إعادة تعيين كلمة المرور بنجاح!" : "Password Reset Successfully!"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isArabic
              ? "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة الخاصة بك."
              : "You can now sign in using your new password."}
          </p>
        </div>
        <Button asChild className="w-full h-11 text-sm font-bold shadow-sm">
          <Link to={ROUTES.login}>
            <span>{isArabic ? "الانتقال إلى تسجيل الدخول" : "Proceed to sign in"}</span>
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs leading-5 text-foreground">
          <p>
            {isArabic
              ? `تم إرسال رمز تحقق مكوّن من 6 أرقام إلى `
              : `A 6-digit verification code has been sent to `}
            <strong dir="ltr" className="font-mono text-primary font-semibold">
              {email}
            </strong>
            .
          </p>
        </div>

        <form className="flex w-full flex-col gap-4" onSubmit={handleResetPassword}>
          <AuthTextField
            id="code"
            label={isArabic ? "رمز التحقق (6 أرقام)" : "Verification Code (6 digits)"}
            icon={KeyRound}
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoComplete="one-time-code"
            required
          />

          <AuthPasswordField
            label={isArabic ? "كلمة المرور الجديدة" : "New Password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={isArabic ? "8 أحرف على الأقل" : "At least 8 characters"}
            required
          />

          <AuthPasswordField
            label={isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={isArabic ? "أعد إدخال كلمة المرور" : "Re-enter new password"}
            required
          />

          {resendNotice && (
            <p role="status" className="text-start text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {resendNotice}
            </p>
          )}

          {submitError && (
            <p role="alert" className="w-full text-start text-xs text-destructive">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full mt-1 h-11 text-sm font-bold shadow-sm"
            disabled={!canSubmitReset || isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {isArabic ? "جارٍ الحفظ..." : "Resetting password..."}
              </span>
            ) : (
              <>
                <span>{isArabic ? "تأكيد وتغيير كلمة المرور" : "Confirm and change password"}</span>
                <DirectionalArrow />
              </>
            )}
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setSubmitError(null);
              setResendNotice(null);
            }}
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5 rtl:rotate-180" />
            <span>{isArabic ? "تغيير البريد الإلكتروني" : "Use a different email"}</span>
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${resendLoading ? "animate-spin" : ""}`} />
            <span>{isArabic ? "إعادة إرسال الرمز" : "Resend code"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form className="flex w-full flex-col gap-4.5" onSubmit={handleSendEmail}>
        <AuthTextField
          id="email"
          label={t("auth.email")}
          icon={Mail}
          placeholder="name@company.com"
          autoComplete="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {submitError && (
          <p role="alert" className="w-full text-start text-xs text-destructive">
            {submitError}
          </p>
        )}

        <Button
          type="submit"
          className="w-full mt-2 h-11 text-sm font-bold shadow-sm"
          disabled={!canSubmitEmail || isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              {isArabic ? "جارٍ الإرسال..." : "Sending..."}
            </span>
          ) : (
            <>
              <span>{isArabic ? "إرسال رمز إعادة التعيين" : "Send reset code"}</span>
              <DirectionalArrow />
            </>
          )}
        </Button>
      </form>

      <p className="w-full text-center text-sm">
        <span className="text-muted-foreground">{t("auth.backToLogin")} </span>
        <Link to={ROUTES.login} className="font-bold text-primary hover:underline">
          {t("auth.login")}
        </Link>
      </p>
    </div>
  );
}
