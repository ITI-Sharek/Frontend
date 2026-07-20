import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useId, useState } from "react";

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
        getApiErrorMessage(error, "تعذر تسجيل الدخول، تحقق من بياناتك وحاول مرة أخرى."),
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
          <AuthDivider label="أو عبر البريد" />

          <AuthTextField
            id="email"
            label="البريد الإلكتروني"
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthPasswordField
            label="كلمة المرور"
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
                تذكرني
              </label>
            </div>
            <Link
              to={ROUTES.forgotPassword}
              className="text-sm font-semibold text-primary"
            >
              نسيت كلمة المرور؟
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
            <span>{isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل دخول"}</span>
          </Button>
        </form>
      </Card>

      <DevLoginButtons onLoginSuccess={onLoginSuccess} />

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">ليس لديك حساب؟ </span>
        <Link to={ROUTES.register} className="font-bold text-primary">
          إنشاء حساب جديد
        </Link>
      </p>
    </>
  );
}
