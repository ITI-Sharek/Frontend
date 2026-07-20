/**
 * مساحة التعاون بعد القبول: مهمة → نقاش → تسليم، يربطها خيط تدقيق واحد.
 * الألوان من متغيرات النظام حتى تعمل في الوضعين الفاتح والداكن.
 */
export function WorkspaceIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 448"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* خيط التدقيق: يبدأ من يمين القراءة وينزل عبر المراحل الثلاث */}
      <line
        x1="526"
        y1="44"
        x2="526"
        y2="386"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      <circle cx="526" cy="44" r="5" fill="var(--primary)" />
      <circle cx="526" cy="196" r="5" fill="var(--primary)" />
      <circle cx="526" cy="340" r="5" fill="var(--primary)" />

      {/* بطاقة المهمة */}
      <g>
        <rect
          x="36"
          y="12"
          width="464"
          height="124"
          rx="12"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <text
          x="472"
          y="46"
          textAnchor="end"
          fontSize="15"
          fontWeight="700"
          fill="var(--foreground)"
        >
          المهمة
        </text>
        <rect
          x="60"
          y="28"
          width="104"
          height="26"
          rx="13"
          fill="var(--review-amber)"
          fillOpacity="0.14"
        />
        <text
          x="112"
          y="45.5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="var(--review-amber)"
        >
          قيد التنفيذ
        </text>
        <rect x="212" y="68" width="260" height="9" rx="4.5" fill="var(--border)" />
        <rect
          x="292"
          y="88"
          width="180"
          height="9"
          rx="4.5"
          fill="var(--border)"
          fillOpacity="0.6"
        />
        <circle
          cx="86"
          cy="106"
          r="12"
          fill="var(--primary)"
          fillOpacity="0.16"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
        <rect
          x="108"
          y="101"
          width="72"
          height="9"
          rx="4.5"
          fill="var(--border)"
          fillOpacity="0.6"
        />
      </g>

      {/* بطاقة النقاش */}
      <g>
        <rect
          x="64"
          y="160"
          width="436"
          height="118"
          rx="12"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <text
          x="472"
          y="192"
          textAnchor="end"
          fontSize="15"
          fontWeight="700"
          fill="var(--foreground)"
        >
          نقاش مرتبط بالمهمة
        </text>
        <rect
          x="252"
          y="206"
          width="220"
          height="26"
          rx="10"
          fill="var(--border)"
          fillOpacity="0.4"
        />
        <rect
          x="92"
          y="240"
          width="184"
          height="26"
          rx="10"
          fill="var(--primary)"
          fillOpacity="0.12"
        />
      </g>

      {/* بطاقة التسليم */}
      <g>
        <rect
          x="36"
          y="302"
          width="464"
          height="112"
          rx="12"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <text
          x="472"
          y="336"
          textAnchor="end"
          fontSize="15"
          fontWeight="700"
          fill="var(--foreground)"
        >
          التسليم
        </text>
        {/* ملف الدليل */}
        <rect
          x="404"
          y="352"
          width="42"
          height="46"
          rx="6"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
        />
        <line
          x1="414"
          y1="368"
          x2="436"
          y2="368"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="414"
          y1="380"
          x2="436"
          y2="380"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="176" y="360" width="204" height="9" rx="4.5" fill="var(--border)" />
        <rect
          x="240"
          y="380"
          width="140"
          height="9"
          rx="4.5"
          fill="var(--border)"
          fillOpacity="0.6"
        />
        <rect
          x="60"
          y="358"
          width="118"
          height="26"
          rx="13"
          fill="var(--evidence-teal)"
          fillOpacity="0.16"
        />
        <text
          x="119"
          y="375.5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          className="fill-evidence-teal-foreground dark:fill-evidence-teal"
        >
          جاهز للمراجعة
        </text>
      </g>

      {/* ختم التحقق عند نهاية الخيط */}
      <g>
        <circle
          cx="526"
          cy="412"
          r="20"
          fill="var(--evidence-teal)"
          fillOpacity="0.16"
          stroke="var(--evidence-teal)"
          strokeWidth="1.5"
        />
        <path
          d="M517 412l6 6 12-13"
          fill="none"
          stroke="var(--evidence-teal)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
