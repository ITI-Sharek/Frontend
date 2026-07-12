import React from "react";

/** AuthDivider — "or via email" style divider line with centered mono label. */
export function AuthDivider({ label }) {
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center", padding: "8px 0" }}>
      <div style={{ height: 1, flex: 1, borderTop: "1px solid var(--border)" }} />
      <span style={{ padding: "0 16px", fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.65px", color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div style={{ height: 1, flex: 1, borderTop: "1px solid var(--border)" }} />
    </div>
  );
}
