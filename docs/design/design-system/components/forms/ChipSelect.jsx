import React from "react";

/** ChipSelect — pill-shaped multi/single choice chips (experience, team size, interests). */
export function ChipSelect({ label, options, value, onChange, multiple = false }) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(optionValue) {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(next);
    } else {
      onChange(optionValue);
    }
  }

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column", gap: 6 }}>
      <span style={{ width: "100%", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.65px", color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={isSelected}
              style={{
                borderRadius: 999,
                border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                background: isSelected ? "var(--primary)" : "var(--input-bg)",
                color: isSelected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                padding: "8px 16px",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.15s, background-color 0.15s, color 0.15s",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
