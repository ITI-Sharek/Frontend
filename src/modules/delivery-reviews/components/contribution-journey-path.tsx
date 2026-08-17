import { BadgeCheck, Check, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

import type { DeliveryLifecycleStatus } from "../types/delivery.types";

/**
 * The contribution journey.
 *
 * A contribution moves through a fixed sequence — apply, get chosen, deliver,
 * get approved — and every screen in the product referred to that sequence
 * without ever drawing it. This renders the real `lifecycleStatus` against the
 * real stages, so the reader can see how far a piece of work has travelled
 * instead of decoding a status string.
 *
 * Numbering is used because this genuinely is ordered: stage three cannot
 * happen before stage two. The wave is not decoration either — it is what lets
 * four nodes and four captions share one band without the captions colliding.
 */

const STAGES = [
  { key: "applied", icon: Check },
  { key: "review", icon: BadgeCheck },
  { key: "delivery", icon: Check },
  { key: "approved", icon: BadgeCheck },
] as const;

/** Which stage a given lifecycle status has reached (0-based, -1 = none). */
function stageIndexFor(status: DeliveryLifecycleStatus): number {
  switch (status) {
    case "PENDING_OWNER_REVIEW":
      return 1;
    case "AWAITING_DELIVERY":
    case "CHANGES_REQUESTED":
    case "DELIVERY_SUBMITTED":
      return 2;
    case "COMPLETED":
      return 3;
    default:
      // Terminal negatives (declined, expired, withdrawn, cancelled) stop the
      // journey where it was rather than pretending it advanced.
      return 0;
  }
}

/** Terminal states where the path should read as stopped, not in progress. */
function isHalted(status: DeliveryLifecycleStatus): boolean {
  return (
    status === "DECLINED_BY_OWNER" ||
    status === "NOT_SELECTED" ||
    status === "EXPIRED" ||
    status === "WITHDRAWN" ||
    status === "REQUEST_CANCELLED" ||
    status === "DELIVERY_REJECTED"
  );
}

/**
 * Builds a smooth curve that passes exactly through the node centres, so the
 * HTML nodes and the SVG wave cannot drift apart at any viewport width.
 */
function wavePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const midX = (prev.x + next.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return d;
}

export function ContributionJourneyPath({
  status,
  className,
}: {
  status: DeliveryLifecycleStatus;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = !i18n.language.startsWith("en");
  const reached = stageIndexFor(status);
  const halted = isHalted(status);
  /* A finished contribution has no "current" stage — every node is done. */
  const complete = status === "COMPLETED";

  // Nodes alternate above and below the band's centre line.
  const count = STAGES.length;
  const base = STAGES.map((stage, index) => ({
    stage,
    index,
    x: ((index + 0.5) / count) * 100,
    y: index % 2 === 0 ? 34 : 66,
  }));

  // Arabic reads right to left, so the journey starts on the right.
  const points = base.map((p) => ({ ...p, x: isRtl ? 100 - p.x : p.x }));
  const ordered = isRtl ? [...points].reverse() : points;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-[150px] w-full sm:h-[164px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* The route not yet travelled. */}
          <path
            d={wavePath(ordered.map((p) => ({ x: p.x, y: p.y })))}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 3"
          />
          {/* The route already travelled, drawn only as far as it got. */}
          <path
            d={wavePath(
              ordered
                .filter((p) => p.index <= reached)
                .map((p) => ({ x: p.x, y: p.y })),
            )}
            fill="none"
            stroke={halted ? "var(--destructive)" : "var(--evidence-teal)"}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {points.map(({ stage, index, x, y }) => {
          const done = complete ? index <= reached : index < reached;
          const current = !complete && index === reached;
          const Icon = halted && current ? TriangleAlert : stage.icon;

          return (
            <div
              key={stage.key}
              className="absolute flex w-[23%] -translate-x-1/2 flex-col items-center gap-2 text-center rtl:translate-x-1/2"
              style={{ insetInlineStart: `${x}%`, top: `${y}%`, marginTop: "-26px" }}
            >
              <span
                className={cn(
                  "relative flex size-11 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                  done && "border-evidence-teal bg-evidence-teal text-white",
                  current &&
                    !halted &&
                    "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-primary)]",
                  current && halted && "border-destructive bg-destructive text-white",
                  !done && !current && "border-border-strong bg-card text-subtle-foreground",
                )}
              >
                {done || current ? (
                  <Icon className="size-5" aria-hidden />
                ) : (
                  <span className="tnum">{String(index + 1).padStart(2, "0")}</span>
                )}
                {current && !halted ? (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full border-2 border-primary opacity-40"
                  />
                ) : null}
              </span>

              <span
                className={cn(
                  "text-[12px] font-bold leading-tight",
                  done || current ? "text-foreground" : "text-subtle-foreground",
                )}
              >
                {t(`deliveryReviews.journey.${stage.key}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
