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
      <div className="min-w-0 shrink-0 lg:min-w-48">
        <p className="truncate text-base font-bold text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 hidden truncate text-[12px] text-muted-foreground lg:block">
            {description}
          </p>
        )}
      </div>
      {search && (
        <div className="flex min-w-0 flex-1 justify-center px-2">{search}</div>
      )}
      {actions && (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      )}
    </>
  );
}
