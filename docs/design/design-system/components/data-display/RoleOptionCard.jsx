import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** RoleOptionCard — big selectable card used for "contributor vs. project owner" role pick. */
export function RoleOptionCard({ title, description, icon = "users", selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        boxSizing: "border-box",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        borderRadius: "var(--radius-input)",
        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        background: selected ? "color-mix(in srgb, var(--primary) 5%, var(--card))" : "var(--input-bg)",
        padding: 16,
        textAlign: "right",
        cursor: "pointer",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      {selected && (
        <span style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderRadius: "50%", background: "var(--primary)", color: "var(--primary-foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="check" size={11} />
        </span>
      )}
      <span style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: selected ? "var(--primary)" : "color-mix(in srgb, var(--border) 40%, transparent)", color: selected ? "var(--primary-foreground)" : "var(--foreground)" }}>
        <Icon name={icon} size={20} />
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--foreground)" }}>{title}</span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>{description}</span>
    </button>
  );
}
