import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";

export function AuthHeader() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
          aria-label={t("theme.toggle")}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
