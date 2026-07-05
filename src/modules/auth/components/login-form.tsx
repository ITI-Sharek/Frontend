"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Card } from "@/shared/components/ui/card";

import { AuthDivider } from "./auth-divider";
import { AuthPasswordField } from "./auth-password-field";
import { AuthTextField } from "./auth-text-field";
import { SocialAuthButtons } from "./social-auth-buttons";

export function LoginForm() {
  const rememberId = useId();

  return (
    <>
      <Card>
        <form className="flex w-full flex-col gap-6">
          <SocialAuthButtons />
          <AuthDivider label="أو عبر البريد" />

          <AuthTextField
            id="email"
            label="البريد الإلكتروني"
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
          />
          <AuthPasswordField
            label="كلمة المرور"
            autoComplete="current-password"
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
              href={ROUTES.forgotPassword}
              className="text-sm font-semibold text-primary"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <Button type="submit" className="w-full">
            <ArrowLeft className="size-4" />
            <span>تسجيل دخول</span>
          </Button>
        </form>
      </Card>

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">ليس لديك حساب؟ </span>
        <Link href={ROUTES.register} className="font-bold text-primary">
          إنشاء حساب جديد
        </Link>
      </p>
    </>
  );
}
