/** Settings → "الاشتراك": mock plan + usage, per DEC-026 (never a functional purchase CTA). */
export function SubscriptionSettingsSection() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">الاشتراك</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          خطتك الحالية وحدود الاستخدام لهذا الشهر.
        </p>
      </div>

      <div className="rounded-input border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-foreground">Bronze</span>
          <span className="font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
            1 من 2 طلبات اليوم
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        الترقية للخطط الأعلى غير مفعّلة حاليًا.
      </p>
    </div>
  );
}
