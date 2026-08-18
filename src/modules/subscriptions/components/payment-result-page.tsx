import { BadgeCheck, CircleAlert, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/config/routes.config";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { usePaymentStatusQuery } from "../api/queries/use-subscription-query";
import { subscriptionQueryKeys } from "../api/query-keys";
import {
  clearPendingPaymentId,
  readPendingPaymentId,
} from "../services/payment-session.service";

const PAYMENT_STATUS_TIMEOUT_MS = 120_000;

export interface PaymentResultPageProps {
  paymentId?: string;
}

export function PaymentResultPage({ paymentId }: PaymentResultPageProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [resolvedPaymentId, setResolvedPaymentId] = useState<string | null>(
    () => paymentId ?? readPendingPaymentId(),
  );
  const [timedOut, setTimedOut] = useState(false);
  const query = usePaymentStatusQuery(resolvedPaymentId, {
    enabled: !timedOut,
  });
  const payment = query.data;

  useEffect(() => {
    setResolvedPaymentId(paymentId ?? readPendingPaymentId());
    setTimedOut(false);
  }, [paymentId]);

  useEffect(() => {
    if (!payment || payment.status !== "pending") return;
    const timeout = window.setTimeout(
      () => setTimedOut(true),
      PAYMENT_STATUS_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [payment?.paymentId, payment?.status]);

  useEffect(() => {
    if (!payment || payment.status === "pending") return;
    clearPendingPaymentId();
    if (payment.status === "paid") {
      void queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.status,
      });
    }
  }, [payment, queryClient]);

  function retryStatus() {
    setTimedOut(false);
    void query.refetch();
  }

  if (!resolvedPaymentId) {
    return (
      <PaymentResultShell
        title={t("subscriptions.plan.payment.missingTitle")}
        description={t("subscriptions.plan.payment.missingDescription")}
        icon={<CircleAlert className="size-5" aria-hidden />}
        tone="attention"
      >
        <Button asChild>
          <a href={ROUTES.plan}>
            {t("subscriptions.plan.payment.returnToPlan")}
          </a>
        </Button>
      </PaymentResultShell>
    );
  }

  if (query.isPending && !payment) {
    return (
      <PaymentResultShell
        title={t("subscriptions.plan.payment.verifyingTitle")}
        description={t("subscriptions.plan.payment.verifyingDescription")}
        icon={<Loader2 className="size-5 animate-spin" aria-hidden />}
        role="status"
      />
    );
  }

  if (query.isError && !payment) {
    return (
      <PaymentResultShell
        title={t("subscriptions.plan.payment.statusErrorTitle")}
        description={getApiErrorMessage(
          query.error,
          t("subscriptions.plan.payment.statusErrorDescription"),
        )}
        icon={<CircleAlert className="size-5" aria-hidden />}
        tone="attention"
        role="alert"
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={retryStatus}>
            <RefreshCw className="size-4" aria-hidden />
            {t("common.retry")}
          </Button>
          <Button asChild variant="outline">
            <a href={ROUTES.plan}>
              {t("subscriptions.plan.payment.returnToPlan")}
            </a>
          </Button>
        </div>
      </PaymentResultShell>
    );
  }

  if (payment?.status === "pending") {
    return (
      <PaymentResultShell
        title={
          timedOut
            ? t("subscriptions.plan.payment.pendingTimeoutTitle")
            : t("subscriptions.plan.payment.pendingTitle")
        }
        description={
          timedOut
            ? t("subscriptions.plan.payment.pendingTimeoutDescription")
            : t("subscriptions.plan.payment.pendingDescription")
        }
        icon={
          timedOut ? (
            <CircleAlert className="size-5" aria-hidden />
          ) : (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          )
        }
        tone="attention"
        role="status"
      >
        {timedOut ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={retryStatus}>
              <RefreshCw className="size-4" aria-hidden />
              {t("subscriptions.plan.payment.checkAgain")}
            </Button>
            <Button asChild variant="outline">
              <a href={ROUTES.plan}>
                {t("subscriptions.plan.payment.returnToPlan")}
              </a>
            </Button>
          </div>
        ) : null}
      </PaymentResultShell>
    );
  }

  if (payment?.status === "paid") {
    return (
      <PaymentResultShell
        title={t("subscriptions.plan.payment.paidTitle")}
        description={t("subscriptions.plan.payment.paidDescription")}
        icon={<BadgeCheck className="size-5" aria-hidden />}
        tone="evidence"
        role="status"
      >
        <Button asChild>
          <a href={ROUTES.plan}>{t("subscriptions.plan.payment.continue")}</a>
        </Button>
      </PaymentResultShell>
    );
  }

  if (payment?.status === "cancelled" || payment?.status === "refunded") {
    const isRefunded = payment.status === "refunded";
    return (
      <PaymentResultShell
        title={t(
          `subscriptions.plan.payment.${isRefunded ? "refundedTitle" : "cancelledTitle"}`,
        )}
        description={t(
          `subscriptions.plan.payment.${isRefunded ? "refundedDescription" : "cancelledDescription"}`,
        )}
        icon={<CircleAlert className="size-5" aria-hidden />}
        tone="attention"
        role="status"
      >
        <Button asChild>
          <a href={ROUTES.plan}>
            {t("subscriptions.plan.payment.returnToPlan")}
          </a>
        </Button>
      </PaymentResultShell>
    );
  }

  return (
    <PaymentResultShell
      title={t("subscriptions.plan.payment.failedTitle")}
      description={t("subscriptions.plan.payment.failedDescription")}
      icon={<CircleAlert className="size-5" aria-hidden />}
      tone="attention"
      role="alert"
    >
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <a href={ROUTES.plan}>{t("subscriptions.plan.payment.tryAgain")}</a>
        </Button>
        <Button type="button" variant="outline" onClick={retryStatus}>
          <RefreshCw className="size-4" aria-hidden />
          {t("subscriptions.plan.payment.checkAgain")}
        </Button>
      </div>
    </PaymentResultShell>
  );
}

function PaymentResultShell({
  title,
  description,
  icon,
  tone = "default",
  role,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tone?: "default" | "evidence" | "attention";
  role?: "alert" | "status";
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6 sm:px-6 md:py-8">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          {t("subscriptions.title")}
        </p>
        <h1 className="mt-2 text-balance text-[26px] font-bold leading-tight text-foreground md:text-[34px]">
          {t("subscriptions.plan.payment.title")}
        </h1>
        <hr className="sk-rule mt-6" />
      </div>
      <Card tone={tone} role={role} className="grid gap-4 p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-fog text-primary">
            {icon}
          </span>
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {children ? (
          <div className="flex flex-wrap gap-2">{children}</div>
        ) : null}
      </Card>
    </section>
  );
}
