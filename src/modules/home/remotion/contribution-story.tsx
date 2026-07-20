import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

const PHASES = [
  {
    frame: 0,
    label: "فهم الملاءمة والمتطلبات",
    detail: "ملاءمة جزئية · الدليل والناقص واضحان",
    tone: "#6B5CA5",
  },
  {
    frame: 80,
    label: "قرار صاحب المشروع",
    detail: "تم القبول بقرار بشري",
    tone: "#2E3192",
  },
  {
    frame: 160,
    label: "تسليم المساهمة",
    detail: "طلب دمج + وصف العمل + لقطات اختبار",
    tone: "#2E3192",
  },
  {
    frame: 240,
    label: "مراجعة الأدلة",
    detail: "تحقق المالك من النتيجة والمصدر",
    tone: "#D97706",
  },
  {
    frame: 320,
    label: "سجل مساهمة موثوق",
    detail: "مكتملة · متحقق منها · مرئية للعامة",
    tone: "#0F766E",
  },
] as const;

const fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
const monoFamily = '"Geist Mono", ui-monospace, monospace';

export function ContributionStory() {
  const frame = useCurrentFrame();
  const completedPhase = Math.min(
    PHASES.length - 1,
    Math.floor(frame / 80),
  );

  return (
    <AbsoluteFill
      dir="rtl"
      style={{
        backgroundColor: "#F8FAFC",
        color: "#0E1513",
        fontFamily,
        padding: 56,
      }}
    >
      <Interactive.Header
        name="Record header"
        style={{
          alignItems: "center",
          borderBottom: "2px solid #E2E8F0",
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 28,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <strong style={{ fontSize: 34, lineHeight: 1.2 }}>
            سجل مساهمة
          </strong>
          <span style={{ color: "#475569", fontSize: 21 }}>
            نموذج توضيحي · شخص حقيقي، عمل محدد، ودليل قابل للمراجعة
          </span>
        </div>
        <bdi
          dir="ltr"
          style={{
            border: "2px solid #E2E8F0",
            borderRadius: 8,
            color: "#64748B",
            fontFamily: monoFamily,
            fontSize: 18,
            padding: "12px 16px",
          }}
        >
          SHK-2026-0142
        </bdi>
      </Interactive.Header>

      <div
        style={{
          display: "grid",
          flex: 1,
          gap: 48,
          gridTemplateColumns: "1.2fr 0.8fr",
          minHeight: 0,
          paddingTop: 40,
        }}
      >
        <Interactive.Main
          name="Contribution timeline"
          style={{ display: "flex", flexDirection: "column", minWidth: 0 }}
        >
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                color: "#2E3192",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              مشروع أطلس للتوثيق العربي
            </div>
            <h2
              style={{
                fontSize: 43,
                lineHeight: 1.25,
                margin: 0,
                maxWidth: 690,
              }}
            >
              تحسين التنقل بلوحة المفاتيح في الواجهة العربية
            </h2>
            <p style={{ color: "#475569", fontSize: 24, margin: "16px 0 0" }}>
              المساهمة: مريم ع. · المراجع: فريق المشروع
            </p>
          </div>

          <ol
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {PHASES.map((phase, index) => (
              <Sequence
                key={phase.label}
                name={phase.label}
                from={phase.frame}
                layout="none"
              >
                <PhaseRow phase={phase} index={index} />
              </Sequence>
            ))}
          </ol>
        </Interactive.Main>

        <Interactive.Aside
          name="Evidence summary"
          style={{
            alignSelf: "stretch",
            backgroundColor: "#FFFFFF",
            border: "2px solid #E2E8F0",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 30,
          }}
        >
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  backgroundColor:
                    completedPhase === PHASES.length - 1 ? "#2DD4BF" : "#E2E8F0",
                  borderRadius: 999,
                  display: "block",
                  height: 18,
                  width: 18,
                }}
              />
              <strong style={{ fontSize: 27 }}>
                {completedPhase === PHASES.length - 1
                  ? "مساهمة متحقق منها"
                  : "سجل قيد التكوين"}
              </strong>
            </div>

            <EvidenceLine
              label="المصدر"
              value="مستودع محدد + إفادة المالك"
            />
            <EvidenceLine label="طريقة التحقق" value="مراجعة بشرية" />
            <EvidenceLine label="الظهور" value="ملخص عام؛ المصدر الخاص محجوب" />
            <EvidenceLine label="الحداثة" value="محدّث مع آخر مراجعة" />
          </div>

          <div
            style={{
              backgroundColor: "#F3F1FA",
              border: "2px solid #6B5CA5",
              borderRadius: 10,
              padding: 22,
            }}
          >
            <strong style={{ color: "#6B5CA5", fontSize: 22 }}>
              دور الذكاء الاصطناعي: استشاري
            </strong>
            <p
              style={{
                color: "#0E1513",
                fontSize: 20,
                lineHeight: 1.55,
                margin: "10px 0 0",
              }}
            >
              رتّب الإشارات وشرح النقص. صاحب المشروع اتخذ القرار، والمراجعة
              البشرية أكدت النتيجة.
            </p>
          </div>
        </Interactive.Aside>
      </div>
    </AbsoluteFill>
  );
}

function PhaseRow({
  phase,
  index,
}: {
  phase: (typeof PHASES)[number];
  index: number;
}) {
  const frame = useCurrentFrame();

  return (
    <Interactive.Li
      name={`${index + 1}. ${phase.label}`}
      style={{
        alignItems: "center",
        display: "grid",
        gap: 18,
        gridTemplateColumns: "42px 1fr",
        opacity: interpolate(frame, [0, 18], [0.35, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [0, 18],
          ["0px 12px", "0px 0px"],
          {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          },
        ),
      }}
    >
      <span
        style={{
          alignItems: "center",
          backgroundColor: phase.tone,
          borderRadius: 999,
          color: "#FFFFFF",
          display: "flex",
          fontFamily: monoFamily,
          fontSize: 17,
          fontWeight: 700,
          height: 38,
          justifyContent: "center",
          width: 38,
        }}
      >
        {index + 1}
      </span>
      <div>
        <strong style={{ display: "block", fontSize: 24, lineHeight: 1.3 }}>
          {phase.label}
        </strong>
        <span style={{ color: "#475569", fontSize: 19, lineHeight: 1.4 }}>
          {phase.detail}
        </span>
      </div>
    </Interactive.Li>
  );
}

function EvidenceLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderTop: "2px solid #E2E8F0",
        display: "grid",
        gap: 12,
        gridTemplateColumns: "110px 1fr",
        padding: "18px 0",
      }}
    >
      <span style={{ color: "#64748B", fontSize: 18 }}>{label}</span>
      <strong style={{ fontSize: 19, lineHeight: 1.45 }}>{value}</strong>
    </div>
  );
}
