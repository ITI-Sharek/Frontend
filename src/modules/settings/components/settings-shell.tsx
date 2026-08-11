import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SettingsSectionItem {
  id: string;
  label: string;
}

/**
 * Settings layout with an inner sidebar navigation (à la Upwork settings):
 * a vertical section list on one side, active section content on the other.
 * Generic/presentational — section content is composed by the route.
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
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:px-8">
      <aside className="w-full shrink-0 md:sticky md:top-24 md:w-56">
        <h1 className="mb-4 text-2xl font-bold text-foreground">الإعدادات</h1>
        <nav
          className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible"
          aria-label="أقسام الإعدادات"
        >
          {sections.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelectSection(section.id)}
                className={cn(
                  "shrink-0 rounded-input border-s-2 px-3 py-2.5 text-start text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-border/20 hover:text-foreground",
                )}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-h-[28rem] min-w-0 flex-1 rounded-card border border-border bg-card p-6 md:max-h-[calc(100dvh-7rem)] md:overflow-y-auto md:overscroll-contain">
        {children}
      </div>
    </div>
  );
}
