import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface InfiniteMovingCardsProps {
  items: React.ReactNode[];
  direction?: "forwards" | "reverse";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

const SPEED_DURATION = {
  fast: "20s",
  normal: "40s",
  slow: "80s",
} as const;

export function InfiniteMovingCards({
  items,
  direction = "forwards",
  speed = "normal",
  pauseOnHover = true,
  className,
}: InfiniteMovingCardsProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [duplicated, setDuplicated] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || duplicated) return;
    // Duplicate the list once so the -50% translate loops seamlessly.
    for (const child of Array.from(scroller.children)) {
      const clone = child.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      scroller.appendChild(clone);
    }
    setDuplicated(true);
  }, [duplicated]);

  return (
    <div
      dir="ltr"
      className={cn(
        "relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]",
        className,
      )}
      style={
        {
          "--animation-duration": SPEED_DURATION[speed],
          "--animation-direction": direction,
        } as React.CSSProperties
      }
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          duplicated && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li key={idx} className="shrink-0" dir="rtl">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
