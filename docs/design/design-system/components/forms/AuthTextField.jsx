import React from "react";
import { Input } from "./Input.jsx";
import { Label } from "./Label.jsx";
import { Icon } from "../icons/Icon.jsx";

/** AuthTextField — labeled input with a leading (RTL-trailing) icon. */
export function AuthTextField({ label, icon = "user", id, dir = "ltr", style, ...props }) {
  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", gap: 6 }}>
      <Label htmlFor={id} style={{ width: "100%", textAlign: "right" }}>{label}</Label>
      <div style={{ position: "relative", width: "100%" }}>
        <Input
          id={id}
          dir={dir}
          style={{
            paddingInlineEnd: 16,
            paddingInlineStart: 40,
            textAlign: dir === "rtl" ? "right" : "left",
            ...style,
          }}
          {...props}
        />
        <Icon
          name={icon}
          size={16}
          style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", color: "var(--muted-foreground)" }}
        />
      </div>
    </div>
  );
}
