import React from "react";

/** AuthHero — centered logo mark + big heading + subtext, atop every auth card. */
export function AuthHero({ heading, subtext, logoSrc = "../../assets/logo-mark.png" }) {
  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <img src={logoSrc} alt="Share-k" style={{ width: 80, height: 80, objectFit: "contain" }} />
      <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <h1 style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 48, lineHeight: "56px", fontWeight: 700, letterSpacing: "-1.2px", color: "var(--foreground)" }}>
          {heading}
        </h1>
        <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: "24px", color: "var(--muted-foreground)" }}>
          {subtext}
        </p>
      </div>
    </div>
  );
}
