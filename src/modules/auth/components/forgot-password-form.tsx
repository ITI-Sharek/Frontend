import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

import { AuthTextField } from "./auth-text-field";

export function ForgotPasswordForm() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-6">
      <form className="flex w-full flex-col gap-4.5">
        <AuthTextField
          id="email"
          label={t("auth.email")}
          icon={Mail}
          placeholder="name@company.com"
          autoComplete="email"
        />

        <Button type="submit" className="w-full mt-2 h-11 text-sm font-bold shadow-sm">
          <ArrowLeft className="size-4" />
          <span>{t("auth.sendResetLink")}</span>
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
