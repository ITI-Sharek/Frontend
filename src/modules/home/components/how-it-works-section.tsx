import {
  ClipboardCheck,
  Compass,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { JourneyPathIllustration } from "./illustrations/journey-path-illustration";

function getJourney(t: TFunction) {
  return [
    {
      icon: Compass,
      title: t("landing.journeyStep1Title"),
      description: t("landing.journeyStep1Description"),
    },
    {
      icon: ClipboardCheck,
      title: t("landing.journeyStep2Title"),
      description: t("landing.journeyStep2Description"),
    },
    {
      icon: MessagesSquare,
      title: t("landing.journeyStep3Title"),
      description: t("landing.journeyStep3Description"),
    },
    {
      icon: ShieldCheck,
      title: t("landing.journeyStep4Title"),
      description: t("landing.journeyStep4Description"),
    },
  ];
}

export function HowItWorksSection() {
  const { t } = useTranslation();
  const journey = getJourney(t);

  return (
    <section id="journey" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {t("landing.journeyHeading")}
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-8 text-muted-foreground">
              {t("landing.journeyDescription")}
            </p>
            <JourneyPathIllustration className="mt-12 hidden w-full max-w-[240px] lg:block" />
          </div>

          <ol className="border-t border-border">
            {journey.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-4 border-b border-border py-7 sm:grid-cols-[56px_1fr] sm:gap-6 sm:py-9"
              >
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span
                    className="font-mono text-sm font-semibold text-primary"
                    dir="ltr"
                  >
                    0{index + 1}
                  </span>
                  <step.icon
                    className="size-6 text-primary"
                    aria-hidden
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-8 text-foreground sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[68ch] text-sm leading-7 text-muted-foreground sm:text-base">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
