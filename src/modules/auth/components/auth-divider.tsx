export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center py-0.5">
      <div className="h-px flex-1 border-t border-border" />
      <span className="px-3 font-mono text-[11px] tracking-[0.5px] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 border-t border-border" />
    </div>
  );
}
