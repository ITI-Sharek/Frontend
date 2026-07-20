/**
 * السجل المهني كدفتر قيود: ملف شخصي تتراكم تحته المساهمات،
 * ولكل سطر حالة صادقة — متحقق منها أو ما تزال قيد المراجعة.
 */
export function ContributionLedgerIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 520 444"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* عمود القيد الذي يصل المساهمات بالملف */}
      <line
        x1="452"
        y1="112"
        x2="452"
        y2="330"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* بطاقة الملف الشخصي */}
      <g>
        <rect
          x="36"
          y="20"
          width="448"
          height="92"
          rx="12"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <circle
          cx="436"
          cy="66"
          r="26"
          fill="var(--primary)"
          fillOpacity="0.14"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
        <circle cx="436" cy="59" r="8" fill="var(--primary)" fillOpacity="0.7" />
        <path
          d="M420 82a16 12 0 0 1 32 0"
          fill="var(--primary)"
          fillOpacity="0.7"
        />
        <rect x="256" y="50" width="134" height="10" rx="5" fill="var(--muted-foreground)" />
        <rect
          x="298"
          y="72"
          width="92"
          height="8"
          rx="4"
          fill="var(--border)"
        />
        <rect
          x="60"
          y="53"
          width="96"
          height="26"
          rx="13"
          fill="var(--primary)"
          fillOpacity="0.12"
        />
        <text
          x="108"
          y="70.5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="var(--primary)"
        >
          سجل مهني
        </text>
      </g>

      {/* سطر: مساهمة متحقق منها */}
      <LedgerRow y={140} tone="verified" label="متحقق منها" titleWidth={216} metaWidth={132} />
      {/* سطر: مساهمة متحقق منها */}
      <LedgerRow y={216} tone="verified" label="متحقق منها" titleWidth={176} metaWidth={104} />
      {/* سطر: مساهمة قيد المراجعة */}
      <LedgerRow y={292} tone="review" label="قيد المراجعة" titleWidth={196} metaWidth={148} />

      {/* السطر القادم: دعوة لا ادعاء */}
      <g>
        <rect
          x="36"
          y="372"
          width="448"
          height="56"
          rx="12"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <text
          x="260"
          y="405"
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--muted-foreground)"
        >
          مساهمتك التالية
        </text>
      </g>
    </svg>
  );
}

function LedgerRow({
  y,
  tone,
  label,
  titleWidth,
  metaWidth,
}: {
  y: number;
  tone: "verified" | "review";
  label: string;
  titleWidth: number;
  metaWidth: number;
}) {
  const accent = tone === "verified" ? "var(--evidence-teal)" : "var(--review-amber)";
  const cy = y + 30;

  return (
    <g>
      <rect
        x="36"
        y={y}
        width="448"
        height="60"
        rx="10"
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <circle
        cx="452"
        cy={cy}
        r="14"
        fill="var(--card)"
        stroke={accent}
        strokeWidth="1.5"
      />
      {tone === "verified" ? (
        <path
          d={`M446 ${cy}l4 4 8-9`}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <line
            x1="452"
            y1={cy - 6}
            x2="452"
            y2={cy + 1}
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="452"
            y1={cy + 1}
            x2="457"
            y2={cy + 4}
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      <rect
        x={422 - titleWidth}
        y={y + 16}
        width={titleWidth}
        height="9"
        rx="4.5"
        fill="var(--muted-foreground)"
        fillOpacity="0.75"
      />
      <rect
        x={422 - metaWidth}
        y={y + 36}
        width={metaWidth}
        height="8"
        rx="4"
        fill="var(--border)"
      />
      <rect
        x="60"
        y={cy - 13}
        width="100"
        height="26"
        rx="13"
        fill={accent}
        fillOpacity="0.14"
      />
      <text
        x="110"
        y={cy + 4.5}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill={tone === "review" ? "var(--review-amber)" : undefined}
        className={
          tone === "verified"
            ? "fill-evidence-teal-foreground dark:fill-evidence-teal"
            : undefined
        }
      >
        {label}
      </text>
    </g>
  );
}
