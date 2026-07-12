import React from "react";

/** Card — the auth card container: rounded-card radius, border, soft shadow, 33px padding. */
export function Card({ className, style, children, ...props }) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--border)",
        background: "var(--card)",
        padding: 33,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
