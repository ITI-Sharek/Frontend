"use client";

import { ArrowLeft, Mail, User } from "lucide-react";
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

export function RegisterForm() {
  const termsId = useId();

  return (
    <>
      <Card>
        <form className="flex w-full flex-col gap-6">
          <SocialAuthButtons />
          <AuthDivider label="أو عبر البريد" />

          <AuthTextField
            id="fullName"
            label="الاسم الكامل"
            icon={User}
            dir="rtl"
            placeholder="محمد أحمد"
            autoComplete="name"
          />
          <AuthTextField
            id="email"
            label="البريد الإلكتروني"
            icon={Mail}
            placeholder="name@company.com"
            autoComplete="email"
          />
          <AuthPasswordField label="كلمة المرور" autoComplete="new-password" />

          <div className="flex w-full items-start gap-2 pt-2">
            <Checkbox id={termsId} className="mt-1" />
            <label
              htmlFor={termsId}
              className="flex-1 text-right text-sm text-muted-foreground"
            >
              أوافق على{" "}
              <a href="#" className="font-semibold text-primary">
                شروط الخدمة
              </a>{" "}
              و{" "}
              <a href="#" className="font-semibold text-primary">
                سياسة الخصوصية
              </a>{" "}
              الخاصة بـ Share-k.
            </label>
          </div>

          <Button type="submit" className="w-full">
            <ArrowLeft className="size-4" />
            <span>إنشاء حسابي المجاني</span>
          </Button>
        </form>
      </Card>

      <p className="w-full text-center text-base">
        <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
        <Link href={ROUTES.login} className="font-bold text-primary">
          تسجيل الدخول
        </Link>
      </p>
    </>
  );
}
