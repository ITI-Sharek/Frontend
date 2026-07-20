export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-footer-bg">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/logo-1.png"
            alt=""
            width={38}
            height={24}
            className="h-6 w-auto"
          />
          <span className="font-wordmark text-lg font-bold text-primary" dir="ltr">
            Sharek
          </span>
        </div>
        <p>مساحة تعاون تحفظ دليلاً موثوقاً على العمل المكتمل.</p>
        <p dir="ltr" className="font-mono text-xs">
          © 2026 Sharek
        </p>
      </div>
    </footer>
  );
}
