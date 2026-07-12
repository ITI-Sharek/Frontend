import React from "react";

/** Label — small mono-tracked field label. */
export function Label({ className, style, children, ...props }) {
  return (
    <label
      className={className}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        letterSpacing: "0.65px",
        color: "var(--muted-foreground)",
        userSelect: "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  );
}
