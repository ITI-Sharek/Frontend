import React from "react";

/** Input — bare text input matching the app's 50px-tall field. */
export function Input({ className, style, ...props }) {
  return (
    <input
      className={className}
      style={{
        display: "flex",
        height: 50,
        width: "100%",
        boxSizing: "border-box",
        borderRadius: "var(--radius-input)",
        border: "1px solid var(--border)",
        background: "var(--input-bg)",
        padding: "13px 17px",
        fontFamily: "var(--font-sans)",
        fontSize: 16,
        color: "var(--foreground)",
        outline: "none",
        transition: "border-color 0.15s",
        ...style,
      }}
      {...props}
    />
  );
}
