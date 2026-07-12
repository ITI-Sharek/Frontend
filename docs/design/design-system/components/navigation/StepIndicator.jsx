import React from "react";
import { Icon } from "../icons/Icon.jsx";

/** StepIndicator — numbered progress stepper for the multi-step register form. */
export function StepIndicator({ steps, currentStep }) {
  return (
    <ol style={{ display: "flex", width: "100%", alignItems: "center", listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;
        return (
          <li key={step} style={{ display: "flex", flex: isLast ? "0 0 auto" : "1 1 auto", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: `1px solid ${isCompleted || isActive ? "var(--primary)" : "var(--border)"}`,
                  background: isCompleted ? "var(--primary)" : "transparent",
                  color: isCompleted ? "var(--primary-foreground)" : isActive ? "var(--primary)" : "var(--muted-foreground)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {isCompleted ? <Icon name="check" size={16} /> : index + 1}
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", color: isActive || isCompleted ? "var(--foreground)" : "var(--muted-foreground)" }}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div style={{ margin: "0 8px", height: 1, flex: 1, background: isCompleted ? "var(--primary)" : "var(--border)", transition: "background-color 0.15s" }} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
