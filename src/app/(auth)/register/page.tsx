import type { Metadata } from "next";

import { AuthHero, RegisterForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "إنشاء حساب جديد | Sharek",
};

export default function RegisterPage() {
  return (
    <>
      <AuthHero
        heading="إنشاء حساب جديد"
        subtext="انضم إلى مجتمع المطورين والخبراء التقنيين"
      />
      <RegisterForm />
    </>
  );
}
