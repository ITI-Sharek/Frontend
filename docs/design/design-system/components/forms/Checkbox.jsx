import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

/** Checkbox — square, rounded-social, teal when checked, with a check glyph. */
export function Checkbox({ checked, defaultChecked, onCheckedChange, className, style, disabled, ...props }) {
  const [internal, setInternal] = useState(defaultChecked || false);
  const isChecked = checked !== undefined ? checked : internal;

  function toggle() {
    if (disabled) return;
    const next = !isChecked;
    if (checked === undefined) setInternal(next);
    onCheckedChange && onCheckedChange(next);
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={toggle}
      className={className}
      style={{
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: "var(--radius-social)",
        border: `1px solid ${isChecked ? "var(--primary)" : "var(--border)"}`,
        background: isChecked ? "var(--primary)" : "var(--input-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 0.15s, border-color 0.15s",
        padding: 0,
        ...style,
      }}
      {...props}
    >
      {isChecked && <Icon name="check" size={11} style={{ color: "var(--primary-foreground)" }} />}
    </button>
  );
}
