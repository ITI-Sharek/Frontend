import React from "react";

const SIZES = { sm: 32, md: 40, lg: 52 };

/** Avatar — circular profile picture with an optional online-status dot (Figma "PP/light" family). */
export function Avatar({ src, alt = "", size = "md", online, style }) {
  const px = SIZES[size] || SIZES.md;
  return (
    <span style={{ position: "relative", display: "inline-block", width: px, height: px, flexShrink: 0, ...style }}>
      {src ? (
        <img src={src} alt={alt} style={{ width: px, height: px, borderRadius: "50%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ width: px, height: px, borderRadius: "50%", display: "block", background: "color-mix(in srgb, var(--primary) 30%, var(--border))" }} />
      )}
      {online !== undefined && (
        <span
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: px * 0.28,
            height: px * 0.28,
            borderRadius: "50%",
            border: "2px solid var(--card)",
            background: online ? "#22c55e" : "var(--muted-foreground)",
          }}
        />
      )}
    </span>
  );
}
