import React from "react";

/** SiteFooter — copyright + support/terms/privacy links, mono-tracked. */
export function SiteFooter() {
  return (
    <footer style={{ width: "100%", borderTop: "1px solid var(--border)", background: "var(--footer-bg)" }}>
      <div
        dir="ltr"
        style={{
          display: "flex",
          width: "100%",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          letterSpacing: "0.65px",
          color: "var(--muted-foreground)",
        }}
      >
        <span>© 2026 Share-k.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Support</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
        </div>
      </div>
    </footer>
  );
}
