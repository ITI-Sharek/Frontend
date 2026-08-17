import {
  Bell,
  CreditCard,
  Github,
  Globe,
  Settings2,
  User,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export interface SettingsSectionItem {
  id: string;
  label: string;
}

const SECTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  profile: User,
  github: Github,
  language: Globe,
  notifications: Bell,
  subscription: CreditCard,
};

/**
 * Settings layout with an inner sidebar navigation:
 * a vertical section list on one side, active section content on the other.
 */
export function SettingsShell({
  sections,
  activeSectionId,
  onSelectSection,
  children,
}: {
  sections: SettingsSectionItem[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-6 sm:px-6 lg:px-8">
      {/* Settings Top Header */}
      <div className="flex flex-col gap-1 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings2 className="size-5 stroke-[2.2]" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("settings.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("settings.personal.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <aside className="w-full lg:sticky lg:top-24 lg:col-span-4 xl:col-span-3.5">
          <nav
            className="flex flex-row gap-1.5 overflow-x-auto rounded-2xl border border-border/80 bg-card p-2 shadow-2xs lg:flex-col lg:overflow-visible"
            aria-label={t("settings.nav")}
          >
            {sections.map((section) => {
              const isActive = section.id === activeSectionId;
              const Icon = SECTION_ICONS[section.id] ?? Settings2;
              return (
                <button
                  key={section.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onSelectSection(section.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-start text-xs font-semibold transition-all lg:w-full",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold ring-2 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-[28rem] min-w-0 flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs sm:p-8 lg:col-span-8 xl:col-span-8.5">
          {children}
        </main>
      </div>
    </div>
  );
}
