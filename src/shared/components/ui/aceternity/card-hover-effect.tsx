import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface HoverEffectItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface CardHoverEffectProps {
  items: HoverEffectItem[];
  className?: string;
}

export function CardHoverEffect({ items, className }: CardHoverEffectProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-2xl bg-primary/10 dark:bg-primary/15"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 flex h-full flex-col gap-3 rounded-card border border-border bg-card p-6">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
