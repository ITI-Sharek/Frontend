import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full rounded-card border border-border bg-card p-[33px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.37)]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
