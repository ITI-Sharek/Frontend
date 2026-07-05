export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-footer-bg">
      <div
        className="flex w-full items-center justify-between p-8 font-mono text-[13px] tracking-[0.65px] text-muted-foreground"
        dir="ltr"
      >
        <span>© 2026 Share-k.</span>
        <div className="flex items-start gap-6">
          <a href="#" className="hover:text-foreground">
            Support
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
