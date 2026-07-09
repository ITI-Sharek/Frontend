import { createFileRoute } from "@tanstack/react-router";

import { AuthHero, LoginForm } from "@/modules/auth";

export const Route = createFileRoute("/_authLayout/login")({
  head: () => ({
    meta: [{ title: "تسجيل الدخول | Sharek" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <>
      <AuthHero heading="مرحباً بك مجدداً" subtext="سجل دخولك" />
      <LoginForm />
    </>
  );
}
