import React, { useState } from "react";
import { Input } from "./Input.jsx";
import { Label } from "./Label.jsx";
import { Icon } from "../icons/Icon.jsx";

/** AuthPasswordField — labeled password input, lock glyph + show/hide toggle. */
export function AuthPasswordField({ label, id, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", gap: 6 }}>
      <Label htmlFor={id} style={{ width: "100%", textAlign: "right" }}>{label}</Label>
      <div style={{ position: "relative", width: "100%" }}>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          dir="ltr"
          style={{ paddingInlineStart: 40, paddingInlineEnd: 40, textAlign: "left" }}
          {...props}
        />
        <Icon name="lock" size={16} style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--muted-foreground)", display: "flex" }}
        >
          <Icon name={visible ? "eye-off" : "eye"} size={16} />
        </button>
      </div>
    </div>
  );
}
