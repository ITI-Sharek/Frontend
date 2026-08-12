import { Loader2, MailCheck, RotateCcw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import {
  resendEmailVerification,
  verifyEmail,
} from "../../services/auth.service";
import type { AuthSessionDto } from "../../types/auth.types";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;

interface VerifyEmailStepProps {
  email: string;
  verificationExpiresAt: string;
  onVerified: (session: AuthSessionDto) => Promise<void> | void;
}

export function VerifyEmailStep({
  email,
  verificationExpiresAt,
  onVerified,
}: VerifyEmailStepProps) {
  const { t, i18n } = useTranslation();
  const codeInputId = useId();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const isCodeComplete = code.length === OTP_LENGTH;

  async function handleVerify() {
    if (!isCodeComplete || isVerifying) return;

    setError(null);
    setIsVerifying(true);
    try {
      const session = await verifyEmail({ email, code });
      await onVerified(session);
    } catch (verifyError) {
      setError(
        getApiErrorMessage(verifyError, t("register.verify.invalidCode")),
      );
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending) return;

    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      await resendEmailVerification(email);
      setNotice(t("register.verify.codeSent"));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (resendError) {
      setError(
        getApiErrorMessage(resendError, t("register.verify.resendError")),
      );
    } finally {
      setIsResending(false);
    }
  }

  const expiresAtLabel = formatExpiryTime(
    verificationExpiresAt,
    i18n.language.startsWith("en") ? "en" : "ar",
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailCheck className="size-7" />
        </span>
        <h2 className="text-lg font-bold text-foreground">
          {t("register.verify.title")}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {t("register.verify.description", { length: OTP_LENGTH })}{" "}
          <span dir="ltr" className="font-semibold text-foreground">
            {email}
          </span>
          {expiresAtLabel && (
            <>
              <br />
              {t("register.verify.validUntil", { time: expiresAtLabel })}
            </>
          )}
        </p>
      </div>

      <form
        className="flex w-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
      >
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor={codeInputId} className="w-full text-right">
            {t("register.verify.codeLabel")}
          </Label>
          <Input
            id={codeInputId}
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            placeholder="123456"
            className="text-center text-2xl font-bold tracking-[0.5em]"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
            }
            aria-describedby={`${codeInputId}-status`}
          />
          <p
            id={`${codeInputId}-status`}
            aria-live="polite"
            className="min-h-[1.25rem] w-full text-right text-xs"
          >
            {error && <span className="text-destructive">{error}</span>}
            {!error && notice && (
              <span className="text-muted-foreground">{notice}</span>
            )}
          </p>
        </div>

        <Button type="submit" disabled={!isCodeComplete || isVerifying}>
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("register.verify.verifying")}</span>
            </>
          ) : (
            <span>{t("register.verify.confirm")}</span>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={resendCooldown > 0 || isResending}
          onClick={handleResend}
        >
          <RotateCcw className="size-4" />
          <span>
            {resendCooldown > 0
              ? t("register.verify.resendAfter", { seconds: resendCooldown })
              : isResending
                ? t("register.verify.resending")
                : t("register.verify.resend")}
          </span>
        </Button>
      </form>
    </div>
  );
}

function formatExpiryTime(iso: string, locale: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
