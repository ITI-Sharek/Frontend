import { createFileRoute } from "@tanstack/react-router";

import { AuthHero, RegisterForm } from "@/modules/auth";

export const Route = createFileRoute("/_authLayout/register")({
  head: () => ({
    meta: [{ title: "إنشاء حساب جديد | Sharek" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
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
