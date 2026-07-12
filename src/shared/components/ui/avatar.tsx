import { cn } from "@/lib/utils";

/**
 * Design-system Avatar (Figma "PP/light" family): circular picture, tinted
 * placeholder fallback, optional online-status dot. `xl` extends the
 * system's three sizes for profile heroes.
 */
const AVATAR_SIZES = {
  sm: "size-8",
  md: "size-10",
  lg: "size-[52px]",
  xl: "size-20",
} as const;

const DOT_SIZES = {
  sm: "size-2.5",
  md: "size-3",
  lg: "size-3.5",
  xl: "size-5",
} as const;

type AvatarSize = keyof typeof AVATAR_SIZES;

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  /** Renders the status dot only when explicitly provided. */
  online?: boolean;
  /** Single character (e.g. first letter of the name) shown when no image. */
  fallback?: string;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  size = "md",
  online,
  fallback,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0",
        AVATAR_SIZES[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="block size-full rounded-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_30%,var(--border))] text-2xl font-bold text-foreground">
          {fallback}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute -right-px -bottom-px rounded-full border-2 border-card",
            DOT_SIZES[size],
            online ? "bg-[#22c55e]" : "bg-muted-foreground",
          )}
        />
      )}
    </span>
  );
}
