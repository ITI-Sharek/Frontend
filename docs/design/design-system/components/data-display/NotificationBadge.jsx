import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** NotificationBadge — icon button with a small red count badge (top-right). */
export function NotificationBadge({ icon = "bell", count = 0, style }) {
  return (
    <div style={{ position: "relative", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <Icon name={icon} size={20} style={{ color: "var(--foreground)" }} />
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            borderRadius: 999,
            background: "#fb2c36",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}
