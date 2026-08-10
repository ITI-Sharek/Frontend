import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative w-full rounded-card border border-border bg-card p-6",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
