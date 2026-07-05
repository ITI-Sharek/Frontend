import type { Metadata } from "next";

import { AuthHero, ForgotPasswordForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور | Sharek",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHero
        heading="نسيت كلمة المرور"
        subtext="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
      />
      <ForgotPasswordForm />
    </>
  );
}
