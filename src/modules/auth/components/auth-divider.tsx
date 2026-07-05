export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center py-2">
      <div className="h-px flex-1 border-t border-border" />
      <span className="px-4 font-mono text-[13px] tracking-[0.65px] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 border-t border-border" />
    </div>
  );
}
