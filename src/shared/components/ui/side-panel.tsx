import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SidePanel({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label="إغلاق اللوحة"
        className="absolute inset-0 size-full cursor-default bg-foreground/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
        aria-describedby={description ? "side-panel-description" : undefined}
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-2xl flex-col border-s border-border bg-background shadow-[0_0_48px_rgba(14,21,19,0.18)]",
          className,
        )}
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-border bg-card px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2
              id="side-panel-title"
              className="text-xl font-bold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p
                id="side-panel-description"
                className="mt-1 text-sm leading-6 text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="إغلاق"
            className="flex size-10 shrink-0 items-center justify-center rounded-input border border-border bg-card text-muted-foreground transition-colors hover:bg-surface-fog hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClose}
          >
            <X className="size-4.5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}
