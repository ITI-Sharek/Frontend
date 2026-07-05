import type { Metadata } from "next";

import { AuthHero, LoginForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "تسجيل الدخول | Sharek",
};

export default function LoginPage() {
  return (
    <>
      <AuthHero heading="مرحباً بك مجدداً" subtext="سجل دخولك" />
      <LoginForm />
    </>
  );
}
