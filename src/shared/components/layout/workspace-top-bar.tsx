import type { ReactNode } from "react";

export function WorkspaceTopBar({
  title,
  description,
  search,
  actions,
}: {
  title: string;
  description?: string;
  search?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      <div className="min-w-0 shrink-0">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>
      {search && <div className="flex min-w-0 flex-1 justify-center">{search}</div>}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </>
  );
}
