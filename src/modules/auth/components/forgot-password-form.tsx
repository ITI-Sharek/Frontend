import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { AuthTextField } from "./auth-text-field";

export function ForgotPasswordForm() {
  const { t } = useTranslation();

  return (
    <>
      <Card>
        <form className="flex w-full flex-col gap-6">
          <AuthTextField
            id="email"
            label={t("auth.email")}
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
          />

          <Button type="submit" className="w-full">
            <ArrowLeft className="size-4" />
            <span>{t("auth.sendResetLink")}</span>
          </Button>
        </form>
      </Card>

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">{t("auth.backToLogin")} </span>
        <Link to={ROUTES.login} className="font-bold text-primary">
          {t("auth.login")}
        </Link>
      </p>
    </>
  );
}
