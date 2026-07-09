import { createFileRoute } from "@tanstack/react-router";

import { AuthHero, ForgotPasswordForm } from "@/modules/auth";

export const Route = createFileRoute("/_authLayout/forgot-password")({
  head: () => ({
    meta: [{ title: "نسيت كلمة المرور | Sharek" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
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
