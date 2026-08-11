import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full rounded-card border border-border bg-card p-[33px] shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45),0_1px_3px_rgba(0,0,0,0.3)]",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
