import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AuthHero, ForgotPasswordForm } from "@/modules/auth";

export const Route = createFileRoute("/_authLayout/forgot-password")({
  head: () => ({
    meta: [{ title: "Sharek" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <>
      <AuthHero
        heading={t("forgotPassword.title")}
        subtext={t("forgotPassword.description")}
      />
      <ForgotPasswordForm />
    </>
  );
}
