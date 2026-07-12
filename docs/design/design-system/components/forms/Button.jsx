import React from "react";

const VARIANT_STYLE = {
  primary: {
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: "var(--radius-input)",
    boxShadow: "0 10px 15px -3px rgba(45,212,191,0.2), 0 4px 6px -4px rgba(45,212,191,0.2)",
  },
  outline: {
    background: "var(--card)",
    color: "var(--foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-social)",
  },
  ghost: {
    background: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
    borderRadius: "8px",
  },
};

const SIZE_STYLE = {
  default: { padding: "16px", fontSize: 16 },
  sm: { padding: "13px 24px", fontSize: 13, fontFamily: "var(--font-mono)", letterSpacing: "0.65px" },
  icon: { width: 36, height: 36, padding: 0 },
};

/**
 * Button — primary CTA (teal, glow shadow), outline (social/secondary), and ghost (icon-only chrome).
 */
export function Button({ variant = "primary", size = "default", disabled, className, style, children, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s, background-color 0.15s",
        ...VARIANT_STYLE[variant],
        ...SIZE_STYLE[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.opacity = "0.9";
        if (variant === "outline") e.currentTarget.style.background = "color-mix(in srgb, var(--border) 20%, var(--card))";
        if (variant === "ghost") e.currentTarget.style.color = "var(--foreground)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.opacity = "1";
        if (variant === "outline") e.currentTarget.style.background = "var(--card)";
        if (variant === "ghost") e.currentTarget.style.color = "var(--muted-foreground)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
