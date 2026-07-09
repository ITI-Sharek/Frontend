import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva  } from "class-variance-authority";
import type {VariantProps} from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "rounded-input bg-primary text-primary-foreground shadow-[0_10px_15px_-3px_rgba(45,212,191,0.2),0_4px_6px_-4px_rgba(45,212,191,0.2)] dark:shadow-[0_10px_15px_-3px_rgba(87,241,219,0.1),0_4px_6px_-4px_rgba(87,241,219,0.1)] hover:opacity-90",
        outline:
          "rounded-social border border-border bg-card text-foreground hover:bg-border/20",
        ghost: "rounded-md text-muted-foreground hover:text-foreground",
      },
      size: {
        default: "h-auto px-4 py-4 text-base",
        sm: "h-auto px-6 py-[13px] text-[13px] font-mono tracking-[0.65px]",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
