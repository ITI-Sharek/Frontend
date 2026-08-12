import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { storageService } from "@/services/storage.service";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card } from "@/shared/components/ui/card";

import { AuthDivider } from "./auth-divider";
import { AuthPasswordField } from "./auth-password-field";
import { DevLoginButtons } from "./dev-login-buttons";
import { AuthTextField } from "./auth-text-field";
import { SocialAuthButtons } from "./social-auth-buttons";
import { loginUser } from "../services/auth.service";
import type { AuthSessionDto } from "../types/auth.types";

interface LoginFormProps {
  onLoginSuccess?: (session: AuthSessionDto) => void | Promise<void>;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const rememberId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = email.trim() !== "" && password !== "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const session = await loginUser({ email, password });
      storageService.setAccessToken(session.tokens.accessToken);
      storageService.setRefreshToken(session.tokens.refreshToken);
      await onLoginSuccess?.(session);
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, t("auth.loginError")),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
          <SocialAuthButtons />
          <AuthDivider label={t("auth.orViaEmail")} />

          <AuthTextField
            id="email"
            label={t("auth.email")}
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthPasswordField
            label={t("auth.password")}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex w-full items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Checkbox id={rememberId} />
              <label
                htmlFor={rememberId}
                className="text-sm text-muted-foreground"
              >
                {t("auth.rememberMe")}
              </label>
            </div>
            <Link
              to={ROUTES.forgotPassword}
              className="text-sm font-semibold text-primary"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {submitError && (
            <p className="w-full text-right text-sm text-destructive">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            <ArrowLeft className="size-4" />
            <span>{isSubmitting ? t("auth.loggingIn") : t("auth.loginButton")}</span>
          </Button>
        </form>
      </Card>

      <DevLoginButtons onLoginSuccess={onLoginSuccess} />

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">{t("auth.noAccount")} </span>
        <Link to={ROUTES.register} className="font-bold text-primary">
          {t("auth.createAccount")}
        </Link>
      </p>
    </>
  );
}
