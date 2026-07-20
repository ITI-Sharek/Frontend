import type { ReactNode } from "react";

export function WorkspaceTopBar({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </>
  );
}
