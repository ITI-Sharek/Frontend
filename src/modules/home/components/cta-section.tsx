
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { Button } from "@/shared/components/ui/button";

import { VerificationSeal } from "./illustrations/verification-seal";

export function CtaSection() {
  const { t } = useTranslation();
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 border-y border-border py-10 sm:py-14 lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-6">
            <VerificationSeal className="hidden size-20 shrink-0 text-primary sm:block" />
            <div>
              <h2 className="max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                {t("landing.ctaHeading")}
              </h2>
              <p className="mt-4 max-w-[68ch] text-base leading-8 text-muted-foreground">
                {t("landing.ctaDescription")}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button
              asChild
              variant="primary"
              size="default"
              className="min-h-12 px-6"
            >
              <Link to={ROUTES.register}>
                {t("landing.ctaCreateAccount")}
                <DirectionalArrow />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="default"
              className="min-h-12"
            >
              <Link to={ROUTES.login}>{t("landing.ctaLogin")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
