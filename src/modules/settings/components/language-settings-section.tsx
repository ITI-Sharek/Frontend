import { useState } from "react";

import { cn } from "@/lib/utils";

const LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
] as const;

/** Settings → "اللغة": mock preference toggle (no backend persistence yet). */
export function LanguageSettingsSection() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">اللغة</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          لغة عرض الواجهة. الدعم الكامل لتبديل الاتجاه (RTL/LTR) قادم.
        </p>
      </div>
      <div className="flex gap-2">
        {LANGUAGES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={language === option.value}
            onClick={() => setLanguage(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              language === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-input-bg text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
