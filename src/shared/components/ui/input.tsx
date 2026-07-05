import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[50px] w-full rounded-input border border-border bg-input-bg px-[17px] py-[13px] text-base text-foreground outline-none transition-colors placeholder:text-input-placeholder disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
