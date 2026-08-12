import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { ContributionLedgerIllustration } from "./illustrations/contribution-ledger-illustration";

function getRecordPoints(t: TFunction) {
  return [
    {
      term: t("landing.recordAccumulatesTerm"),
      description: t("landing.recordAccumulatesDescription"),
    },
    {
      term: t("landing.recordHonestTerm"),
      description: t("landing.recordHonestDescription"),
    },
    {
      term: t("landing.recordSharedLimitsTerm"),
      description: t("landing.recordSharedLimitsDescription"),
    },
  ];
}

export function ContributionRecordSection() {
  const { t } = useTranslation();
  const recordPoints = getRecordPoints(t);

  return (
    <section
      id="record"
      className="scroll-mt-24 border-y border-border bg-footer-bg py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <ContributionLedgerIllustration className="order-2 h-auto w-full max-w-lg justify-self-center lg:order-1 lg:justify-self-start" />

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {t("landing.recordHeading")}
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-muted-foreground">
              {t("landing.recordDescription")}
            </p>
            <dl className="mt-8 border-t border-border">
              {recordPoints.map((point) => (
                <div
                  key={point.term}
                  className="grid gap-1.5 border-b border-border py-5"
                >
                  <dt className="font-semibold text-foreground">
                    {point.term}
                  </dt>
                  <dd className="max-w-[62ch] text-sm leading-7 text-muted-foreground">
                    {point.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
