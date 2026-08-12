import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type StoryPhase = {
  frame: number;
  label: string;
  detail: string;
  tone: string;
};

function getPhases(t: TFunction): StoryPhase[] {
  return [
    {
      frame: 0,
      label: t("landing.storyPhase1Label"),
      detail: t("landing.storyPhase1Detail"),
      tone: "#6B5CA5",
    },
    {
      frame: 80,
      label: t("landing.storyPhase2Label"),
      detail: t("landing.storyPhase2Detail"),
      tone: "#2E3192",
    },
    {
      frame: 160,
      label: t("landing.storyPhase3Label"),
      detail: t("landing.storyPhase3Detail"),
      tone: "#2E3192",
    },
    {
      frame: 240,
      label: t("landing.storyPhase4Label"),
      detail: t("landing.storyPhase4Detail"),
      tone: "#D97706",
    },
    {
      frame: 320,
      label: t("landing.storyPhase5Label"),
      detail: t("landing.storyPhase5Detail"),
      tone: "#0F766E",
    },
  ];
}

const fontFamily = '"IBM Plex Sans Arabic", system-ui, sans-serif';
const monoFamily = '"Geist Mono", ui-monospace, monospace';

export function ContributionStory() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const phases = getPhases(t);
  const completedPhase = Math.min(
    phases.length - 1,
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
            {t("landing.storyHeaderTitle")}
          </strong>
          <span style={{ color: "#475569", fontSize: 21 }}>
            {t("landing.storyHeaderSubtitle")}
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
              {t("landing.storyProjectName")}
            </div>
            <h2
              style={{
                fontSize: 43,
                lineHeight: 1.25,
                margin: 0,
                maxWidth: 690,
              }}
            >
              {t("landing.storyContributionTitle")}
            </h2>
            <p style={{ color: "#475569", fontSize: 24, margin: "16px 0 0" }}>
              {t("landing.storyContributorsLine")}
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
            {phases.map((phase, index) => (
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
                    completedPhase === phases.length - 1 ? "#2DD4BF" : "#E2E8F0",
                  borderRadius: 999,
                  display: "block",
                  height: 18,
                  width: 18,
                }}
              />
              <strong style={{ fontSize: 27 }}>
                {completedPhase === phases.length - 1
                  ? t("landing.storyStatusVerified")
                  : t("landing.storyStatusBuilding")}
              </strong>
            </div>

            <EvidenceLine
              label={t("landing.storyEvidenceSourceLabel")}
              value={t("landing.storyEvidenceSourceValue")}
            />
            <EvidenceLine
              label={t("landing.storyEvidenceMethodLabel")}
              value={t("landing.storyEvidenceMethodValue")}
            />
            <EvidenceLine
              label={t("landing.storyEvidenceVisibilityLabel")}
              value={t("landing.storyEvidenceVisibilityValue")}
            />
            <EvidenceLine
              label={t("landing.storyEvidenceFreshnessLabel")}
              value={t("landing.storyEvidenceFreshnessValue")}
            />
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
              {t("landing.storyAiRoleTitle")}
            </strong>
            <p
              style={{
                color: "#0E1513",
                fontSize: 20,
                lineHeight: 1.55,
                margin: "10px 0 0",
              }}
            >
              {t("landing.storyAiRoleDescription")}
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
  phase: StoryPhase;
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
