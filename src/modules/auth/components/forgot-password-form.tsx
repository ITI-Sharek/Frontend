import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { AuthTextField } from "./auth-text-field";

export function ForgotPasswordForm() {
  return (
    <>
      <Card>
        <form className="flex w-full flex-col gap-6">
          <AuthTextField
            id="email"
            label="البريد الإلكتروني"
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
          />

          <Button type="submit" className="w-full">
            <ArrowLeft className="size-4" />
            <span>ارسال رابط الاستعادة</span>
          </Button>
        </form>
      </Card>

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">العودة الي </span>
        <Link to={ROUTES.login} className="font-bold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
