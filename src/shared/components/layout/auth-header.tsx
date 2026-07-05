"use client";

import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AuthHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- next-themes mount guard to avoid SSR/client theme mismatch
    setMounted(true);
  }, []);

  return (
    <header className="flex w-full items-center justify-between border-b border-border bg-header-bg px-8 py-4">
      <div
        className="font-wordmark text-[32px] font-bold tracking-[-0.32px] text-primary"
        dir="ltr"
      >
        Sharek
      </div>
      <div className="flex items-center gap-4" dir="ltr">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
        <button
          type="button"
          className="flex items-center gap-1 font-mono text-[13px] tracking-[0.65px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span dir="rtl">العربية</span>
          <Globe className="size-5" />
        </button>
      </div>
    </header>
  );
}
