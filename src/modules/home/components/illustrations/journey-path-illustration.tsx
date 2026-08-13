/**
 * The journey path: four stations ending in a verification seal — a visual
 * echo of the section steps.
 */
export function JourneyPathIllustration({ className }: { className?: string }) {
  const steps = [24, 88, 152] as const;

  return (
    <svg
      viewBox="0 0 220 260"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <line
        x1="188"
        y1="24"
        x2="188"
        y2="216"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      {steps.map((y, index) => (
        <g key={y}>
          <circle
            cx="188"
            cy={y}
            r="10"
            fill="var(--background)"
            stroke="var(--primary)"
            strokeWidth="1.5"
          />
          <circle cx="188" cy={y} r="3" fill="var(--primary)" />
          <rect
            x={166 - 128 + index * 18}
            y={y - 4}
            width={128 - index * 18}
            height="8"
            rx="4"
            fill="var(--border)"
            fillOpacity={1 - index * 0.25}
          />
        </g>
      ))}
      {/* Final station: verification seal */}
      <circle
        cx="188"
        cy="216"
        r="13"
        fill="var(--evidence-teal)"
        fillOpacity="0.16"
        stroke="var(--evidence-teal)"
        strokeWidth="1.5"
      />
      <path
        d="M182 216l4 4 8-9"
        fill="none"
        stroke="var(--evidence-teal)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="92" y="212" width="74" height="8" rx="4" fill="var(--border)" fillOpacity="0.4" />
    </svg>
  );
}
