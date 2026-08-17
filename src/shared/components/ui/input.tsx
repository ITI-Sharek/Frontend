import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-12 w-full rounded-input border border-border-strong bg-input-bg px-4 py-3 text-[15px] text-foreground outline-none",
        "transition-[border-color,box-shadow] duration-150 ease-out",
        "placeholder:text-input-placeholder",
        "hover:border-primary/35",
        "focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/18",
        "disabled:cursor-not-allowed disabled:bg-surface-fog disabled:opacity-60",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
