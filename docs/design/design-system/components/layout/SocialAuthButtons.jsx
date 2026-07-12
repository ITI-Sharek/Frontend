import React from "react";
import { Button } from "../forms/Button.jsx";
import { Icon } from "../icons/Icon.jsx";

/** SocialAuthButtons — GitHub + Google outline buttons, side by side. Fits an open-source dev platform. */
export function SocialAuthButtons() {
  return (
    <div style={{ display: "flex", width: "100%", gap: 16 }} dir="ltr">
      <Button type="button" variant="outline" size="sm" style={{ flex: 1 }}>
        <span>GitHub</span>
        <Icon name="github" size={16} />
      </Button>
      <Button type="button" variant="outline" size="sm" style={{ flex: 1 }}>
        <span>Google</span>
        <Icon name="chrome" size={16} />
      </Button>
    </div>
  );
}
