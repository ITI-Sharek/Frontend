import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "system"] as const;
type Theme = (typeof THEMES)[number];

const LABELS: Record<Theme, string> = {
  light: "الوضع النهاري",
  dark: "الوضع الليلي",
  system: "تلقائي (النظام)",
};

const ICONS: Record<Theme, React.ReactNode> = {
  light: <Sun className="size-4.5" aria-hidden="true" />,
  dark: <Moon className="size-4.5" aria-hidden="true" />,
  system: <SunMoon className="size-4.5" aria-hidden="true" />,
};

/** Cycles through light → dark → system on each click. */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch — render nothing on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="inline-flex size-10 items-center justify-center rounded-input border border-border bg-card opacity-0" />
    );
  }

  const current = (THEMES.includes(theme as Theme) ? theme : "system") as Theme;

  function cycle() {
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      title={LABELS[current]}
      aria-label={LABELS[current]}
      className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-input border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {ICONS[current]}
    </button>
  );
}
