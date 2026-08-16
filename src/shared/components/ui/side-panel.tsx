import { X } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

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
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent
        className={cn("max-w-2xl", className)}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeRef.current?.focus();
        }}
      >
        <header className="flex shrink-0 items-start gap-4 border-b border-border bg-card px-5 py-4 sm:px-6">
          <SheetHeader className="min-w-0 flex-1">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <SheetClose asChild>
            <Button
              ref={closeRef}
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("common.close")}
              className="shrink-0 text-muted-foreground"
            >
              <X className="size-4.5" aria-hidden />
            </Button>
          </SheetClose>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
