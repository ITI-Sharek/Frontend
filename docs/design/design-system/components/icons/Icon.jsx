import React from "react";

/**
 * Icon — thin wrapper around the Lucide icon set (CDN, lucide-static), the exact
 * icon library used by the Share-k frontend (`lucide-react` in the real app).
 * Recolors via CSS mask so the glyph always inherits `currentColor`.
 */
export function Icon({ name, size = 16, style, ...props }) {
  const url = `https://unpkg.com/lucide-static@0.469.0/icons/${name}.svg`;
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: "currentColor",
        WebkitMask: `url(${url}) center / contain no-repeat`,
        mask: `url(${url}) center / contain no-repeat`,
        ...style,
      }}
      {...props}
    />
  );
}
