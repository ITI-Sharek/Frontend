import React, { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

/** AuthHeader — top bar on auth pages: wordmark left, theme toggle + language switch right. */
export function AuthHeader() {
  const [dark, setDark] = useState(false);
  return (
    <header
      style={{
        display: "flex",
        width: "100%",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        background: "var(--header-bg)",
        padding: "16px 32px",
      }}
    >
      <div dir="ltr" style={{ fontFamily: "var(--font-wordmark)", fontSize: 32, fontWeight: 700, letterSpacing: "-0.32px", color: "var(--primary)" }}>
        Sharek
      </div>
      <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setDark((d) => !d)}
          style={{ display: "flex", width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "none", color: "var(--muted-foreground)", cursor: "pointer" }}
        >
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
        <button
          type="button"
          style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.65px", color: "var(--muted-foreground)", cursor: "pointer" }}
        >
          <span dir="rtl">العربية</span>
          <Icon name="globe" size={20} />
        </button>
      </div>
    </header>
  );
}
